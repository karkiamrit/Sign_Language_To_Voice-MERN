const express = require('express');
const {
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateRole,
  deleteUser,
  isAuthenticated,
  registerUserAndSendOTP,
  verifyOTPAndActivateAccount,
  isAdmin,
} = require('../controller/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/login').post(loginUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/logout').post(logout);

router.route('/me').get(isAuthenticatedUser, getUserDetails);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);

router.route('/admin/user/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateRole)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

router.route('/is-authenticated').get(isAuthenticated);
router.route('/is-admin').get(isAdmin);


router.route('/register').post(registerUserAndSendOTP);
router.route('/verify-otp').post(verifyOTPAndActivateAccount);


module.exports = router;
