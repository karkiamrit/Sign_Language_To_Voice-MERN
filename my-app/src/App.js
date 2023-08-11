import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Footer from './components/Footer';
import TeachableMachineModel from './components/Videos';
import Signup from './components/Signup';
import Login from './components/Login';
import ForgetPassword from './components/forgetPassword';
import axios from 'axios';
import Profile from './components/Profile';
import ChangePassword from './components/changePassword';
import ResetPassword from './components/resetPassword';
import SignLanguageTranslator from './Sign-Language-Translator';
import AdminDashboard from './components/adminDashboard';
import UserTranslation from './components/userTranslation';
import UserDetails from './components/userDetails';
import NotFound from './components/NotFound';


axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in
    

    const checkLoggedIn = async () => {
      try {
        const response = await axios.get('/api/v1/is-authenticated', {
          withCredentials: true,
        });
        if (response.data.success) {
          setIsLoggedIn(true);
          console.log('User is Authenticated');
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    const checkIsAdmin = async () => {
      try {
        const response = await axios.get('/api/v1/is-admin', {
          withCredentials: true,
        });
        if (response.data.role==='admin') {
          
          setIsAdmin(true);
          console.log('User is Admin');
          
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };

    const userCookies = document.cookie; // Get the cookies using document.cookie
    if (userCookies) {
      // Use Promise.all to wait for both requests to finish
      Promise.all([checkLoggedIn(), checkIsAdmin()])
        .then(() => setLoading(false))
        .catch((error) => console.error('Error:', error));
    } else {
      setLoading(false);
    }
  }, []);

  // Define a custom route component to handle protected routes
  const ProtectedRoute = ({ element, auth, admin, redirectTo }) => {
    if (loading) {
      // Show loading component while checking authentication and admin status
      return <div>Loading...</div>;
    }

    if (admin && !isAdmin) {
      // Redirect to login if the user is not an admin
      return <Navigate to={redirectTo} />;
    }

    if (auth && !isLoggedIn) {
      // Redirect to login if the user is not authenticated
      return <Navigate to={redirectTo} />;
    }

    return element;
  };

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} isAdmin={isAdmin}  />
      <Routes>
      
        <Route path="/" element={<Home/>} />

        
        <Route
          path="/gestures"
          element={
            <ProtectedRoute
              auth={isLoggedIn}
              admin={isAdmin}
              redirectTo="/"
              element={<UserTranslation/>}
            />
          }
        />
        <Route path="/profile" element={<Profile />}/>
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/changepassword" element={<ProtectedRoute
              auth={isLoggedIn}
              redirectTo="/"
              element={<ChangePassword />}
            />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/detection" element={<SignLanguageTranslator />} />
        <Route path="/videos" element={<TeachableMachineModel />} />
        

        {/* Protected routes */}
        <Route
          path="/admin/"
          element={
            <ProtectedRoute
              auth={isLoggedIn}
              admin={!isAdmin}
              redirectTo="/login"
              element={<AdminDashboard />}
            />
          }
        />
        <Route
          path="/admin/userdetail"
          element={
            <ProtectedRoute
              auth={isLoggedIn}
              admin={!isAdmin}
              redirectTo="/login"
              element={<UserDetails />}
            />
          }
        />
        <Route path='*' element={<NotFound/>} />
        
      </Routes>
      {!isAdmin && <Footer />}
    </Router>
  );
};

export default App;
