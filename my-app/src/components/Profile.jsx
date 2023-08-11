import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  Heading,
  Text,
  IconButton,
  useDisclosure,
  Modal,
  Box,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
} from '@chakra-ui/react';
import { FaPencilAlt } from 'react-icons/fa';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = () => {
    axios
      .get('/api/v1/me')
      .then((response) => {
        setUser(response.data.user);
        
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };


  const handleEditProfile = () => {
    setName(user.name);
    setEmail(user.email);
    onOpen();
  };

  const handleSubmit = () => {
    const data = { name, email };

    axios
      .put('/api/v1/me/update', data)
      .then((response) => {
        toast({
          title: 'Success',
          description: response.data.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setUser({ ...user, name, email });
        onClose();
      })
      .catch((error) => {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to update profile. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleChangePassword = () => {
    navigate('/changepassword');
  };

  return (
    <Container maxW={'container.xl'} h={'100vh'} p={'16'}>
      <VStack alignItems={'stretch'} spacing={'8'} w={['full', '96']} m={'auto'} my={'16'}>
        <Heading>Profile</Heading>
        {user ? (
          <>
            <Box>
              ID: {user._id}

            </Box>
            <Box>
               Name: {user.name}
            </Box>
            <Box>
               Email: {user.email}
            </Box>
            <IconButton
              icon={<FaPencilAlt />}
              aria-label="Edit Profile"
              variant="outline"
              onClick={handleEditProfile}
            />
            <Button colorScheme="purple" onClick={handleChangePassword}>
              Change Password
            </Button>

            {/* Edit Profile Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Edit Profile</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </FormControl>
                  <Button colorScheme="purple" mt={4} onClick={handleSubmit}>
                    Save Changes
                  </Button>
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
        ) : (
          <Text>Loading user data...</Text>
        )}
      </VStack>
    </Container>
  );
};

export default Profile;
