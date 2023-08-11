import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, HStack, useDisclosure, VStack } from '@chakra-ui/react';
import { BiMenuAltLeft } from 'react-icons/bi';
import axios from 'axios';

const Header = ({ isLoggedIn, setIsLoggedIn, isAdmin }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleLogout = async (event) => {
    event.preventDefault();

    try {
      // Perform the logout API request to your backend
      await axios.post('/api/v1/logout');
      setIsLoggedIn(false);
      // Redirect to the login page or perform any other necessary actions
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Handle the error if necessary
    }
  };

  return (
    <>
      <Button
        pos="fixed"
        zIndex="overlay"
        top="4"
        left="4"
        colorScheme="purple"
        p="0"
        w="10"
        h="10"
        borderRadius="full"
        onClick={onOpen}
      >
        <BiMenuAltLeft size="20" />
      </Button>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader textAlign="center">Sign Language Detection</DrawerHeader>
          <DrawerBody>
            <VStack>
              <Button onClick={onClose} variant="ghost" colorScheme="purple">
                <Link to="/">Home</Link>
              </Button>
              {!isAdmin && isLoggedIn &&<Button onClick={onClose} variant="ghost" colorScheme="purple">
                <Link to="/gestures">Videos</Link>
              </Button>}
              {isLoggedIn && (
                <Button onClick={onClose} variant="ghost" colorScheme="purple">
                  <Link to="/profile">Profile</Link>
                </Button>
              )}
              {isLoggedIn && isAdmin &&<Button onClick={onClose} variant="ghost" colorScheme="purple">
                <Link to="/admin">Admin Dashboard</Link>
              </Button>}
            </VStack>
            <HStack pos="absolute" bottom="10" left="0" w="full" justifyContent="space-evenly">
              {isLoggedIn ? (
                <Button colorScheme="purple" onClick={handleLogout}>
                  Log Out 
                </Button>
              ) : (
                <>
                  <Button onClick={onClose} colorScheme="purple">
                    <Link to="/login">Log In</Link>
                  </Button>
                  <Button onClick={onClose} colorScheme="purple" variant="outline">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </HStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Header;
