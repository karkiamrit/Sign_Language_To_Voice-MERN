import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  return (
    
    <Box
      h="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Heading as="h1" size="2xl" mb={4}>
        Oops! Page not found.
      </Heading>
      <Text fontSize="xl" mb={4}>
        The page you are looking for does not exist.
      </Text>
      <Button
        as={RouterLink}
        to="/"
        colorScheme="blue"
        size="lg"
        variant="outline"
        px={8}
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default NotFound;
