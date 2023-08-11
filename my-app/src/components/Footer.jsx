import React from 'react';
import { Box, Button, Text, Input, Heading, VStack, Stack, HStack } from '@chakra-ui/react';
import { AiOutlineSend, AiFillYoutube, AiFillFacebook, AiFillLinkedin, AiFillGithub } from 'react-icons/ai';

const Footer = () => {
  return (
    <Box bgColor="blackAlpha.900" color="white" p="16" >
      <Stack direction={['column', 'row']}>
        <VStack alignItems={['center', 'stretch']} w="full" px={['0', '4']} mb={['8', '0']}>
          <Heading size="md" textTransform="uppercase" textAlign={['center', 'left']}>
            Subscribe to get updates
          </Heading>
          <HStack borderBottom="2px solid white" py="2">
            <Input
              placeholder="Enter Email Here..."
              border="none"
              borderRadius="none"
              outline="none"
              focusBorderColor="none"
            />
            <Button p="0" colorScheme="purple" variant="ghost" borderRadius="0 20px 20px 0">
              <AiOutlineSend size={20} />
            </Button>
          </HStack>
        </VStack>
        <VStack w="full" borderLeft={['none', '1px solid white']} borderRight={['none', '1px solid white']}>
          <Heading textTransform="uppercase" textAlign={['center', 'center']}>
            PROJECT AWAZ
          </Heading>
          <Text>All Rights Reserved</Text>
        </VStack>
        <VStack w="full" borderRight={['none', '1px solid white']}>
          <Heading size="md" textTransform="uppercase">
            Social Media
          </Heading>
          <Button variant="link" colorScheme="whiteAlpha">
            <a target="_blank" rel="noopener noreferrer" href="https://youtube.com">
              <AiFillYoutube color="red" />
            </a>
          </Button>
          <Button variant="link" colorScheme="whiteAlpha">
            <a target="_blank" rel="noopener noreferrer" href="https://linkedin.com">
              <AiFillLinkedin color="white" />
            </a>
          </Button>
          <Button variant="link" colorScheme="whiteAlpha">
            <a target="_blank" rel="noopener noreferrer" href="https://facebook.com">
              <AiFillFacebook color="blue" />
            </a>
          </Button>
          <Button variant="link" colorScheme="whiteAlpha">
            <a target="_blank" rel="noopener noreferrer" href="https://github.com">
              <AiFillGithub color="black" />
            </a>
          </Button>
        </VStack>
      </Stack>

     
    </Box>
  );
};

export default Footer;
