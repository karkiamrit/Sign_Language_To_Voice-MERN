import cv2
from flask import Flask, render_template, Response
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
import numpy as np
import math
from gtts import gTTS
import tempfile
import subprocess
import pygame
import os

app = Flask(__name__)
pygame.mixer.init()

current_dir = os.path.dirname(os.path.abspath(__file__))

# Specify the relative paths to the model and labels files
model_path = os.path.join(current_dir, "Model", "keras_model.h5")
labels_path = os.path.join(current_dir, "Model", "labels.txt")

detector = HandDetector(maxHands=1)
classifier = Classifier(model_path, labels_path)
offset = 20
imgSize = 400

labels = [chr(ord('A') + i) for i in range(26)]

prev_prediction = ""
previous_text = ""

def speak(text):
    global previous_text
    if text != previous_text:
        with tempfile.NamedTemporaryFile(delete=True) as fp:
            tts = gTTS(text=text, lang='en')
            tts.save(f"{fp.name}.mp3")
            pygame.mixer.music.load(f"{fp.name}.mp3")
            pygame.mixer.music.play()
        previous_text = text



def stream_video():
    prev_prediction = ""  
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)  # Set width to 640 pixels
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        img = cv2.flip(frame, 1)  # Flip the image horizontally for mirror effect

        hands, img = detector.findHands(img)

        if hands:
            hand = hands[0]
            x, y, w, h = hand['bbox']

            imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
            imgCrop = img[y-offset:y+h+offset, x-offset:x+w+offset]
            imgCropShape = imgCrop.shape

            aspectRatio = h / w

            if aspectRatio > 1:
                k = imgSize / h
                wCal = math.ceil(k * w)
                try: 
                    if wCal > 0:  # Check if the width is not empty
                        imgResize = cv2.resize(imgCrop, (wCal, imgSize))
                        imgResizeShape = imgResize.shape
                        wGap = math.ceil((imgSize - wCal) / 2)
                        imgWhite[:, wGap:wCal+wGap] = imgResize
                        prediction, index = classifier.getPrediction(imgWhite, draw=False)
                        print(prediction, index)
                except Exception as e:
                        print(e)    
            else:
                k = imgSize / w
                hCal = math.ceil(k * h)
                try: 
                    if hCal > 0:  # Check if the height is not empty
                        imgResize = cv2.resize(imgCrop, (imgSize, hCal))
                        imgResizeShape = imgResize.shape
                        hGap = math.ceil((imgSize - hCal) / 2)
                        imgWhite[hGap:hCal+hGap, :] = imgResize
                        prediction, index = classifier.getPrediction(imgWhite, draw=False)
                        print(prediction, index)
                except Exception as e:
                        print(e)     

            cv2.putText(img, labels[index], (x, y-20), cv2.FONT_HERSHEY_COMPLEX, 2, (255, 0, 255), 2)

            if prediction == prev_prediction:
                continue

            speak(labels[index])
            prev_prediction = prediction

        ret, buffer = cv2.imencode('.jpg', img)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(stream_video(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)
