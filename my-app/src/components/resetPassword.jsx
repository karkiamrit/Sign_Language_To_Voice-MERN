import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, VStack, Input, Button, Heading, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New password and confirm password do not match.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const data = {
      password: newPassword,
      confirmPassword: confirmPassword
    };

    axios
      .put(`/api/v1/password/reset/${token}`, data)
      .then((response) => {
        toast({
          title: 'Success',
          description: response.data.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: 'Failed to reset password. Please try again.',
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
          <Heading textAlign={'center'}>Reset Password</Heading>
          <Input
            placeholder={'New Password'}
            type={'password'}
            required
            focusBorderColor={'purple.500'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            placeholder={'Confirm Password'}
            type={'password'}
            required
            focusBorderColor={'purple.500'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

export default ResetPassword;
