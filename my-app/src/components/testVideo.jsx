import React, { useEffect, useRef, useState } from 'react';
import * as tmImage from '@teachablemachine/image';
import { Center, Flex, Text } from '@chakra-ui/react';

const TeachableMachineModel = () => {
  const webcamRef = useRef(null);
  const labelRef = useRef(null);
  const [topPrediction, setTopPrediction] = useState('');

  useEffect(() => {
    let model, webcam, maxPredictions;

    const init = async () => {
      const URL = 'https://teachablemachine.withgoogle.com/models/-O_ZeEmhJ/';
      const modelURL = URL + 'model.json';
      const metadataURL = URL + 'metadata.json';

      model = await tmImage.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();

      const flip = true;
      webcam = new tmImage.Webcam(200, 200, flip);
      await webcam.setup();
      await webcam.play();
      window.requestAnimationFrame(loop);

      const webcamCanvas = webcam.canvas;
      const existingWebcamCanvas = webcamRef.current.firstChild;
      if (existingWebcamCanvas) {
        webcamRef.current.replaceChild(webcamCanvas, existingWebcamCanvas);
      } else {
        webcamRef.current.appendChild(webcamCanvas);
      }
    };

    const loop = async () => {
        webcam.update();
        const canvas = webcam.canvas;
        if (canvas) {
          const handROI = await getHandROI(canvas); // Get hand ROI from the webcam canvas
          await predict(handROI);
        }
        // Adjust the frame rate by changing the timeout value (e.g., 1000 ms for 1 FPS)
        setTimeout(() => {
          window.requestAnimationFrame(loop);
        }, 1000);
      };
      

    const getHandROI = async (canvas) => {
      // Placeholder function for hand detection logic
      // Replace with your own hand detection implementation
      
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Dummy implementation to return the entire canvas as ROI
      return canvas;
    };

    const predict = async (handROI) => {
      const prediction = await model.predict(handROI);
      let maxConfidenceIndex = 0;

      for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > prediction[maxConfidenceIndex].probability) {
          maxConfidenceIndex = i;
        }
      }

      const topLabel = prediction[maxConfidenceIndex].className;
      setTopPrediction(topLabel);
    };

    init();

    return () => {
      if (webcam) {
        webcam.stop();
      }
    };
  }, []);

  return (
    <Center height="100vh">
      <Flex direction="column" align="center">
        <div ref={webcamRef}></div>
        <Text fontWeight="bold" fontSize="lg" mt={4}>
          Top Prediction:
        </Text>
        <Text ref={labelRef} fontWeight="bold" fontSize="2xl" mt={2}>
          {topPrediction}
        </Text>
      </Flex>
    </Center>
  );
};

export default TeachableMachineModel;
