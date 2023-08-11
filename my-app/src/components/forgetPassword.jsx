import React, { useState } from 'react';
import {
  Container,
  VStack,
  Input,
  Button,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const toast = useToast();

  

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send a password reset email to the provided email address
    axios
      .post('/api/v1/password/forgot', { email })
      .then((response) => {
        toast({
          title: 'Email Sent',
          description: response.data.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEmail('');
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: 'Failed to send reset password email. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        console.error('Error:', error);
      });
  };

  return (
    <Container maxW={'container.xl'} h={'100vh'} p={'16'}>
      <form onSubmit={handleSubmit}>
        <VStack alignItems={'stretch'} spacing={'8'} w={['full', '96']} m={'auto'} my={'16'}>
          <Heading textAlign={'center'}>Forgot Password</Heading>
          <Input
            placeholder={'Email'}
            type={'email'}
            required
            focusBorderColor={'purple.500'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button colorScheme={'purple'} type={'submit'}>
            Reset Password
          </Button>
          <Text textAlign={'right'}></Text>
        </VStack>
      </form>
    </Container>
  );
};

export default ForgetPassword;
