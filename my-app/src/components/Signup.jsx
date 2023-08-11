import React, { useState } from 'react';
import { Container, VStack, Input, Heading, Button, Text, useToast } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // const userData = {
      //   name,
      //   email,
      //   password,
      //   otp,
      // };

      if (showOtpField) {
        await axios.post('/api/v1/verify-otp', { email,otp });
        console.log('OTP verified successfully');
        
        toast({
          title: 'Success',
          description: 'OTP verified successfully',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        setIsLoggedIn(true);
        // Navigate to the desired route after successful OTP verification
        navigate('/');
      } else {
        await axios.post('/api/v1/register', { name, email, password });
        console.log('OTP sent successfully');
        // Update the state to show the OTP field
        setShowOtpField(true);
        toast({
          title: 'OTP Sent',
          description: 'OTP sent successfully',
          status: 'info',
          duration: 5000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        // If the backend sends a specific error message, show it in the toast
        toast({
          title: 'Error',
          description: error.response.data.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // For other generic errors, show a default message
        toast({
          title: 'Error',
          description: 'Something went wrong',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Container maxW={'container.xl'} h={'100vh'} p={'16'}>
      <form onSubmit={handleSubmit}>
        <VStack alignItems={'stretch'} spacing={'8'} w={['full', '96']} m={'auto'} my={'16'}>
          <Heading textAlign={'center'}>SIGN UP</Heading>
          <Input
            placeholder={'Name'}
            type={'text'}
            required
            focusBorderColor={'purple.500'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder={'Email'}
            type={'email'}
            required
            focusBorderColor={'purple.500'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder={'Password'}
            type={'password'}
            required
            focusBorderColor={'purple.500'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {showOtpField ? (
            <Input
              placeholder={'OTP'}
              type={'text'}
              required
              focusBorderColor={'purple.500'}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          ) : null}
          <Button colorScheme={'purple'} type={'submit'} onSubmit={handleSubmit}>
            {showOtpField ? 'Sign Up' : 'Send OTP'}
          </Button>
          <Text textAlign={'right'}>
            Already Signed Up?{' '}
            <Button variant={'link'} colorScheme={'purple'}>
              <Link to={'/login'}>Login In</Link>
            </Button>
          </Text>
        </VStack>
      </form>
    </Container>
  );
};

export default Signup;
