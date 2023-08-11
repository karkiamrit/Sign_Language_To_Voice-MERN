import React, { useEffect, useRef, useState } from 'react';
import * as tmImage from '@teachablemachine/image';
import { Spinner, Table, Tbody, Td, Th, Thead, Tr, Button } from '@chakra-ui/react';

const TeachableMachineApp = () => {
  const webcamRef = useRef(null);
  let model, webcam, maxPredictions;
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLabel, setCurrentLabel] = useState('');
  const [labelCounter, setLabelCounter] = useState(0);
  const [highestConfidenceLabel, setHighestConfidenceLabel] = useState('');

  const speakLabel = (label) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(label);
    synth.speak(utterance);
  };

  const init = async () => {
    const URL = 'https://teachablemachine.withgoogle.com/models/aLCcf7VFn/';
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);
    try {
      await webcam.setup({ facingMode: 'environment' });
      await webcam.play();
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
    if (webcam) {
      webcam.update();
      await predict();
    }
    window.requestAnimationFrame(loop);
  };

  const predict = async () => {
    if (webcam && webcam.canvas) {
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

  const stopVideo = () => {
    if (webcam && webcam.stop) {
      webcam.stop();
    }
  };

  const speakHighestConfidenceLabel = () => {
    if (highestConfidenceLabel) {
      speakLabel(highestConfidenceLabel);
    }
  };

  useEffect(() => {
    init();

    return () => {
      if (webcam && webcam.stop) {
        webcam.stop();
      }
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#F2F8FD', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {loading ? (
        <Spinner size="xl" color="blue.500" />
      ) : (
        <div style={{ display: 'flex' }}>
          <div style={{ marginRight: '2rem' ,marginTop:'130px'}}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <div ref={webcamRef} style={{ transform: 'scale(1.5)', borderRadius: '8px', overflow: 'hidden' }}></div>
            </div>
            <Button onClick={speakHighestConfidenceLabel} colorScheme="blue" style={{ marginLeft: '150px', marginTop: '100px' }}>Speak</Button>
          </div>
          <Table variant="simple" size="sm" maxWidth="400px" marginLeft={"150px"} color={"black"}>
            <Thead>
              <Tr>
                <Th>Label</Th>
                <Th>Confidence (%)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {predictions.map((prediction, index) => (
                <Tr key={index}>
                  <Td>{prediction.label}</Td>
                  <Td>{prediction.confidence}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TeachableMachineApp;
