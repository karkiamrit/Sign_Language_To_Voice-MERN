import { Container, VStack, Input, Heading, Button, Text, useToast, Select } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // Add role state
  const toast = useToast();

  const handleSubmit = (event) => {
    event.preventDefault();

    const userData = {
      email: email,
      password: password,
      role: role // Include role in the request body
    };
    
    axios
      .post('/api/v1/login', userData, { withCredentials: true })
      .then((response) => {
        console.log('Login successful');
        setIsLoggedIn(true);
        if(role==='admin'){
          window.location.href = '/admin';
        }
        else{
          window.location.href = '/';
        }
        
        
      })
      .catch((error) => {
        console.error('Error:', error);
        if (error.response && error.response.data && error.response.data.message) {
          const errorMessage = error.response.data.message;
          toast({
            title: 'Login Error',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        } else {
          toast({
            title: 'Login Error',
            description: 'An error occurred during login',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }
      });
  };

  return (
    <Container maxW={'container.xl'} h={'100vh'} p={'16'}>
      <form onSubmit={handleSubmit}>
        <VStack alignItems={'stretch'} spacing={'8'} w={['full', '96']} m={'auto'} my={'16'}>
          <Heading>Welcome Back</Heading>
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
          <Select
            placeholder={'Role'} // Add select box for role
            required
            focusBorderColor={'purple.500'}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">admin</option>
            <option value="user">user</option>
          </Select>
          <Button variant={'link'} alignSelf={'flex-end'}>
            <Link to={'/forgetpassword'}>Forgot Password?</Link>
          </Button>

          <Button colorScheme={'purple'} type={'submit'}>
            Log In
          </Button>

          <Text textAlign={'right'}>
            New User?{' '}
            <Button variant={'link'} colorScheme={'purple'}>
              <Link to={'/signup'}>Sign Up</Link>
            </Button>
          </Text>
        </VStack>
      </form>
    </Container>
  );
};

export default Login;
