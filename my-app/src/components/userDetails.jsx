import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
  Image,
  Box,
  Flex,
  Heading,
  IconButton,
  Spacer,
  Avatar,
  Menu,
  MenuButton,
  useDisclosure,
  Button,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react';
import { FiBell } from 'react-icons/fi';

const UserDetail = () => {
  const [gestures, setGestures] = useState([]);
  const [searchIdentifier, setSelectedIdentifier] = useState('');
//   const [GestureDetails, setGestureDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to display per page
  const [editGesture, setEditGesture] = useState(null);
  const [editGestureActivated, setEditGestureActivated] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    fetchAllGestures();
  }, []);

  const fetchAllGestures = () => {
    axios
      .get('/api/v2/admin/gestures')
      .then((response) => {
        setGestures(response.data.gestures);
        setSelectedIdentifier('');
      })
      .catch((error) => {
        console.error('Error fetching gestures:', error);
      });
  };

  const fetchGestureByIdentifier = () => {
    if (searchIdentifier) {
      axios
        .get(`/api/v2/admin/gesture/${searchIdentifier}`)
        .then((response) => {
          setGestures(response.data.gesture);
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
        });
    } else {
      fetchAllGestures();
    }
  };

  const handleEditGesture = (gesture) => {
    setEditGesture(gesture);
    setEditGestureActivated(gesture.isActivated);
    onOpen();
  };

  const submitEditedGesture = () => {
    const updatedGesture = { ...editGesture, gestures: editGesture.gestures };
    axios
      .put(`/api/v2/admin/gesture/${editGesture._id}`, updatedGesture)
      .then((response) => {
        console.log('Gesture updated successfully:', response.data);
        onClose();
        fetchAllGestures();
      })
      .catch((error) => {
        console.error('Error updating gesture:', error);
      });
  };

  const deleteGesture = (gestureId) => {
    axios
      .delete(`/api/v2/admin/gesture/${gestureId}`)
      .then((response) => {
        console.log('Gesture deleted successfully:', response.data);
        fetchAllGestures();
      })
      .catch((error) => {
        console.error('Error deleting gesture:', error);
      });
  };

  

  const totalPages = Math.ceil(gestures.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = gestures.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box h="100vh" p={4} mt={10}>
      <Flex alignItems="center">
        <Heading as="h1" size="lg" ml={10}>
          Gesture Details
        </Heading>
        <Spacer />
        <HStack spacing={2}>
          <IconButton icon={<FiBell />} variant="ghost" aria-label="Notifications" />
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<Avatar size="sm" />}
              variant="ghost"
              aria-label="User Menu"
            />
          </Menu>
        </HStack>
      </Flex>
      <Flex mt={8}>
        <Box w="300px" mr={4}>
          <VStack spacing={2} align="stretch">
            <Button size="lg" colorScheme="blue" variant="ghost" as={RouterLink} to="/admin">
              Dashboard
            </Button>
            <Button size="lg" colorScheme="blue" variant="ghost" as={RouterLink} to="/admin/userdetail">
              User Detail
            </Button>
          </VStack>
        </Box>
        <Box flex="1">
          <Heading as="h2" size="md" mb={4}>
            Gesture Management
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Session Id</Th>
                <Th>UserName</Th>
                <Th>Photo</Th>
                <Th>Facilitated By</Th>
                <Th>Date</Th>
                <Th>Spoken Words</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItems.map((gesture) => (
                <Tr key={gesture._id}>
                  <Td>{gesture._id}</Td>
                  <Td>{gesture.userName}</Td>
                  <Td>
                    <Image src={gesture.photoDataURL} alt="User Photo" boxSize="80px" objectFit="cover" />
                  </Td>
                  <Td>{gesture.facilitator}</Td>
                  <Td>{new Date(gesture.timestamp).toLocaleString()}</Td>
                  <Td>{gesture.gestures && gesture.gestures.join(' ')}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="teal"
                      variant="ghost"
                      mr={2}
                      onClick={() => handleEditGesture(gesture)}
                    >
                      Edit
                    </Button>
                    <Button size="sm" colorScheme="red" variant="ghost" onClick={() => deleteGesture(gesture._id)}>
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Box mt={8}>
            <FormControl>
              <FormLabel fontSize={20}>Search Gesture by Username</FormLabel>
              <Input
                type="text"
                value={searchIdentifier}
                onChange={(e) => setSelectedIdentifier(e.target.value)}
              />
            </FormControl>
            <Button mt={5} colorScheme="blue" onClick={fetchGestureByIdentifier}>
              Search
            </Button>
          </Box>
        </Box>
      </Flex>

      {/* Pagination */}
      <Flex mt={8} justifyContent="center">
        <Button
          size="sm"
          colorScheme="gray"
          variant="ghost"
          onClick={handlePrevPage}
          isDisabled={currentPage === 1}
        >
          Prev
        </Button>
        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            size="sm"
            colorScheme={currentPage === pageNumber ? 'blue' : 'gray'}
            variant="ghost"
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          size="sm"
          colorScheme="gray"
          variant="ghost"
          onClick={handleNextPage}
          isDisabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Flex>

      
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Gesture</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>UserName</FormLabel>
              <Input
                type="text"
                value={editGesture?.userName || ''}
                onChange={(e) => setEditGesture({ ...editGesture, userName: e.target.value })}
              />
            </FormControl>
            <FormControl mt={2}>
              <FormLabel>Spoken Words</FormLabel>
              <Input
                type="text"
                value={editGesture?.gestures || ''}
                onChange={(e) => setEditGesture({ ...editGesture, gestures: e.target.value })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={submitEditedGesture}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserDetail;
