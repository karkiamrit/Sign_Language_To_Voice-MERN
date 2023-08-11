import React, { useEffect, useRef, useState } from 'react';
import * as tmImage from '@teachablemachine/image';
import {
  Spinner,
  Container,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import axios from 'axios';

const UserTranslation = () => {
  const webcamRef = useRef(null);
  let webcam;
  let model, maxPredictions;
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLabel, setCurrentLabel] = useState('');
  const [webCam, setWebCam] = useState(null);
  const [labelCounter, setLabelCounter] = useState(0);
  const [highestConfidenceLabel, setHighestConfidenceLabel] = useState('');
  const [userName, setUserName] = useState('');
  const [capturedGestures, setCapturedGestures] = useState([]);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [capturingData, setCapturingData] = useState(false);
  const [latestSpokenLabel, setLatestSpokenLabel] = useState('');
  const [webcamOpen, setWebcamOpen] = useState(false); // Track the webcam status
  const [capturedPhotoBlob, setCapturedPhotoBlob] = useState(null);
  const [facilitator,setFacilitator]=useState(null);

  

  const speakLabel = (label) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(label);
    utterance.lang = 'hi-IN';
    utterance.onend = () => {
      console.log('Speech ended. Label:', label);
      setLatestSpokenLabel(label);
    };
    synth.speak(utterance);
  };

  const getFacilitator=()=>{
    axios
      .get('/api/v1/me')
      .then((response) => {
        setFacilitator(response.data.user.name);
        
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const createNewGestureModel = () => {
    // Implement your code to create a new gesture model from API
    console.log('Creating new gesture model...');
  };

  const init = async () => {
    // const URL = 'https://teachablemachine.withgoogle.com/models/aLCcf7VFn/';
    const URL = 'https://teachablemachine.withgoogle.com/models/vVdef_JFW/'
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);
    try {
      await webcam.setup({ facingMode: 'environment' });
      await webcam.play();
      setWebcamOpen(true); // Set the webcam status to open
      setWebCam(webcam);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }

    window.requestAnimationFrame(loop);

    if (webcamRef.current) {
      webcamRef.current.innerHTML = '';
      webcamRef.current.appendChild(webcam.canvas);
    }

    setLoading(false);
  };

  const loop = async () => {
    if (webcam && !sessionEnded) {
      webcam.update();
      await predict();
    }
    window.requestAnimationFrame(loop);
  };

  const predict = async () => {
    if (webcam && webcam.canvas && !sessionEnded) {
      const prediction = await model.predict(webcam.canvas);
      const predictionData = prediction.map((p) => ({
        label: p.className,
        confidence: (p.probability * 100).toFixed(2),
      }));
      setPredictions(predictionData);

      let highestConfidenceLabel = null;
      let maxConfidence = 0;

      // Find the label with the highest confidence
      prediction.forEach((p) => {
        if (p.probability > maxConfidence) {
          maxConfidence = p.probability;
          highestConfidenceLabel = p.className;
        }
      });

      // Check if the current label is different from the previous label
      if (highestConfidenceLabel && highestConfidenceLabel !== currentLabel) {
        setCurrentLabel(highestConfidenceLabel);
        setLabelCounter(1); // Reset the counter for a new label
      } else if (highestConfidenceLabel === currentLabel) {
        // Increment the counter if the current label is the same as the previous label
        setLabelCounter((prevCounter) => prevCounter + 1);
      } else {
        // Reset the counter if the current label is different from the previous label
        setLabelCounter(0);
      }

      setHighestConfidenceLabel(highestConfidenceLabel); // Update the highestConfidenceLabel state
    }
  };

  // const saveCapturedGestures = (photoDataURL) => {
  //   // Send the capturedGestures and userName to the backend API for storage
  //   axios
  //     .post('/api/v1/storegesture', {
  //       userName: userName,
  //       gestures: capturedGestures,
  //       photoDataURL: photoDataURL,
  //     })
  //     .then((response) => {
  //       console.log('Gestures stored successfully:', response.data);
  //     })
  //     .catch((error) => {
  //       console.error('Error storing gestures:', error);
  //     });
  // };

  const saveCapturedGestures = () => {
    // Send the captured gestures, userName, and photoBlob to the backend API for storage
    
    const formData = new FormData();
    formData.append('userName', userName);
    formData.append('gestures', JSON.stringify(capturedGestures));
    formData.append('facilitator', facilitator)
    formData.append('photo', capturedPhotoBlob);

  
    axios
      .post('/api/v2/storegesture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        console.log('Gestures stored successfully:', response.data);
      })
      .catch((error) => {
        console.error('Error storing gestures and photo data:', error);
      });
  };
  
  

  const stopCaptureData = () => {
    setShowUsernameModal(false); // Hide the username input modal
    setCapturingData(false); // Stop capturing gestures
    saveCapturedGestures(); // Send the capturedGestures to the backend
    setSessionEnded(true); // End the session
  };

  const stopWebcamStream = async () => {
    if (webcamOpen) {
      try {
        await webCam.stop();
        setWebcamOpen(false);
      } catch (error) {
        console.error('Error stopping webcam stream:', error);
      }
    }
  };

  const speakHighestConfidenceLabel = () => {
    if (highestConfidenceLabel) {
      speakLabel(highestConfidenceLabel);
    }
  };

  useEffect(() => {
    init();
    getFacilitator();
    return () => {
      if (webcam && webcam.stop) {
        webcam.stop();
      }
    };
  }, []);

  const handleOpenWebcam = async () => {
    const URL = 'https://teachablemachine.withgoogle.com/models/vVdef_JFW/';
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);
    try {
      await webcam.setup({ facingMode: 'environment' });
      await webcam.play();
      setWebcamOpen(true); // Set the webcam status to open
      setWebCam(webcam);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }

    window.requestAnimationFrame(loop);

    if (webcamRef.current) {
      webcamRef.current.innerHTML = '';
      webcamRef.current.appendChild(webcam.canvas);
    }

  };

  const handleCloseWebcam = () => {
    stopWebcamStream();
  };

  const handleSpeakButtonClick = () => {
    speakHighestConfidenceLabel();
    console.log('handleSpeakButtonClick. highestConfidenceLabel:', highestConfidenceLabel);

    if (!showUsernameModal && latestSpokenLabel === 'suruwat garnuhos' && !capturingData) {
      console.log('Show username input modal');
      setShowUsernameModal(true); // Show the username input modal when 'Yes' is spoken
      setCapturingData(true); // Start capturing gestures
      setCapturedGestures([]); // Reset the array
    } else if (latestSpokenLabel === 'antya garnuhos' && capturingData) {
      // Stop gesture recognized, send the capturedGestures to the backend
      console.log('Stop gesture recognized. Sending capturedGestures to the backend.');
      stopCaptureData();
    } else if (capturingData) {
      // Capture gestures
      console.log('Capture gestures. highestConfidenceLabel:', highestConfidenceLabel);
      setCapturedGestures((prevGestures) => [...prevGestures, highestConfidenceLabel]);
    }
  };

  const handleUsernameSubmit = () => {
    createNewGestureModel();
    setShowInputModal(true); // Show the input sentence modal after username submission if needed
    setShowUsernameModal(false); // Hide the username input modal
    setCapturingData(true); // Start capturing gestures
    setCapturedGestures([]); // Reset the array
  };

  const handleTakePhoto = async () => {
    if (!webCam || !webcamOpen) {
      console.log('Webcam is not available or session ended.');
      return;
    }
  
    const photoCanvas = document.createElement('canvas');
    const photoContext = photoCanvas.getContext('2d');
  
    photoCanvas.width = 400;
    photoCanvas.height = 400;
  
    // Draw the current frame from the webcam onto the canvas
    photoContext.drawImage(webCam.canvas, 0, 0, 400, 400);
  
    // Convert the canvas to a Blob
    const photoBlob = await new Promise((resolve) => {
      photoCanvas.toBlob(resolve, 'image/jpeg'); // You can change the image format if needed (e.g., 'image/png')
    });
    // Call the saveCapturedGestures function with the photoBlob as an argument
    setCapturedPhotoBlob(photoBlob);
    
    console.log('Photo taken and sent to the backend.');
  };
  
  return (
    <div style={{ backgroundColor: '#F2F8FD', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {loading ? (
        <Spinner size="xl" color="blue.500" />
      ) : (
        <div style={{ display: 'flex' }}>
          <div style={{ marginRight: '2rem', marginTop: '130px', position: 'relative' }}>
            <div style={{ position: 'relative', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <div ref={webcamRef} style={{ transform: 'scale(1.5)', borderRadius: '8px', overflow: 'hidden' }}></div>
            </div>
            {webcamOpen ? (
              <Button onClick={handleCloseWebcam} colorScheme="red" style={{ marginTop: '100px' }}>Close Webcam</Button>
            ) : (
              <Button onClick={handleOpenWebcam} colorScheme="green" style={{ marginTop: '100px' }}>Open Webcam</Button>
            )}
            <Button onClick={handleSpeakButtonClick} colorScheme="blue" style={{ marginLeft: '150px', marginTop: '100px' }}>Speak</Button>
            {showUsernameModal && (
              <Modal isOpen={showUsernameModal} onClose={() => setShowUsernameModal(false)}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Enter Username</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <FormControl>
                      <FormLabel>Enter Username</FormLabel>
                      <Input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
                      <Button onClick={handleTakePhoto} colorScheme="purple" style={{ marginTop: '16px' }}>
                          Take Photo
                      </Button>
                    </FormControl>
                  </ModalBody>
                  <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleUsernameSubmit}>Submit</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            )}
            
          </div>
          <Container
            variant="simple"
            size="sm"
            maxWidth="400px"
            marginLeft={"140px"}
            color={"black"}
            style={{
              position: 'absolute',
              right: 10,
              top: '40%',
              transform: 'translateY(-50%)',
              textAlign: 'center',
              backgroundColor: '#F8F8F8',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {highestConfidenceLabel}
            
          </Container>
          <Container style={{position:'absolute',
              right: 550,
              top: '75%',
              transform: 'translateY(-50%)',
              textAlign: 'center',
              backgroundColor: '#F8F8F8',
              padding: '16px',
              borderRadius: '8px',
              }}>
          {sessionEnded && (
              <Alert status="success" mt={4} color={'black'}  position="absolute" bottom={0} >
                <AlertIcon />
                <AlertTitle>Your session has ended. Thank you!</AlertTitle>
                <AlertDescription>
                  You can start a new session by pressing "Speak" again.
                </AlertDescription>
                <CloseButton position="absolute" right="8px" top="8px" onClick={() => setSessionEnded(false)} />
              </Alert>
            )}
          </Container>
        
          
        </div>
      )}
    </div>
  );
}

export default UserTranslation;
