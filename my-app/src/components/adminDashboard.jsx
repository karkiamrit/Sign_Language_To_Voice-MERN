import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
  Select,
  Box,
  Flex,
  Heading,
  IconButton,
  Spacer,
  Avatar,
  Menu,
  MenuButton,
  Button,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { FiBell } from 'react-icons/fi';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [searchUserId, setSearchUserId] = useState('');
  const [editUserActivated, setEditUserActivated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Change this to set the number of items per page
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = () => {
    axios
      .get('/api/v1/admin/users')
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setEditUserActivated(user.isActivated);
    onOpen();
  };

  const submitEditedUser = () => {
    const updatedUser = { ...editUser, isActivated: editUserActivated };
    axios
      .put(`/api/v1/admin/user/${editUser._id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      .then((response) => {
        console.log('User updated successfully:', response.data);
        onClose();
        fetchAllUsers();
      })
      .catch((error) => {
        console.error('Error updating user:', error);
      });
  };

  const deleteUser = (userId) => {
    axios
      .delete(`/api/v1/admin/user/${userId}`)
      .then((response) => {
        console.log('User deleted successfully:', response.data);
        fetchAllUsers();
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
      });
  };

  const searchUserById = () => {
    if (searchUserId) {
      axios
        .get(`/api/v1/admin/user/${searchUserId}`)
        .then((response) => {
          setUsers([response.data.user]);
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
        });
    } else {
      fetchAllUsers();
    }
  };

  // Calculate the index of the first and last items on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  // Function to handle pagination when the page number is changed
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Box h="100vh" p={4} mt={10}>
      <Flex alignItems="center">
        <Heading as="h1" size="lg" ml={8}>
          Admin Dashboard
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
            User Management
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Id</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Activated</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentUsers.map((user) => (
                <Tr key={user._id}>
                  <Td>{user._id}</Td>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.role}</Td>
                  <Td>{String(user.isActivated)}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="teal"
                      variant="ghost"
                      mr={2}
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                    <Button size="sm" colorScheme="red" variant="ghost" onClick={() => deleteUser(user._id)}>
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Box mt={8}>
            <FormControl>
              <FormLabel fontSize={20}>Search User by ID</FormLabel>
              <Input
                type="text"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
              />
            </FormControl>
            <Button mt={5} colorScheme="blue" onClick={searchUserById}>
              Search
            </Button>
          </Box>
        </Box>
      </Flex>
      {/* Pagination */}
      <Box mt={4} display="flex" justifyContent="center" alignItems="center">
        <Button
          variant="ghost"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Box mx={4} fontSize="lg">
          Page {currentPage}
        </Box>
        <Button
          variant="ghost"
          disabled={currentUsers.length < itemsPerPage}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </Box>
      {/* Modal for editing user */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                value={editUser?.name || ''}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />
            </FormControl>
            <FormControl mt={2}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={editUser?.email || ''}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </FormControl>
            <FormControl mt={2}>
              <FormLabel>Role</FormLabel>
              <Input
                type="text"
                value={editUser?.role || ''}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              />
            </FormControl>
            <FormControl mt={2}>
              <FormLabel>Activated</FormLabel>
              <Select
                value={editUserActivated}
                onChange={(e) => setEditUserActivated(e.target.value === 'true')}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={submitEditedUser}>
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

export default AdminDashboard;
