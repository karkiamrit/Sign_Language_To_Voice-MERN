const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../model/userModel");
const comparePassword=require("../model/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail.js");
const crypto=require("crypto");
// const { isAuthenticatedUser } = require("../middleware/auth");
const jwt=require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Send OTP to user's email
const sendOTP = async (email, otp) => {
  try {
    // Code to send OTP to the user's email (using nodemailer or any other library)
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
};


// Register a User and Send OTP
exports.registerUserAndSendOTP = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password should be at least 8 characters long' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    // Save the OTP and user details in the database
    await User.create({
      name,
      email,
      password,
      otp,
      isActivated: false,
    });
    // Send OTP to user's email
    const otpSent = await sendOTP(email, otp);
    if (!otpSent) {
      // If sending OTP fails, delete the user record
      await User.findOneAndDelete({ email });
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error:', error);
    // Handle validation errors and duplicate key errors
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    if (error.name === 'ValidationError') {
      // You can further check the specific validation errors and return appropriate responses
      return res.status(400).json({ message: 'Name should be atleast 2 letters long', error });
    }
    res.status(500).json({ message: 'Signup failed' });
  }
};

// Verify OTP and Activate User Account
exports.verifyOTPAndActivateAccount = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (user.isActivated) {
      return res.status(200).json({ message: 'User account is already activated' });
    }

    // Mark the user account as activated in the database
    user.isActivated = true;
    await user.save();
    cron.schedule('*/5 * * * *', async () => {
      user.otp = null;
      await user.save();
      console.log('OTP set to null after 5 minutes');
    });
    sendToken(user, 200, res);
    res.status(200).json({ message: 'OTP verified and user account activated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
  
};

// User Login
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password, role } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter a valid email and password" });
  }

  let user;
  if (role) {
    // If role is provided, find user by email and role
    user = await User.findOne({ email, role }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "No user exists with this email and role" });
    }
    if (user.role !== role) {
      return res.status(401).json({ message: "You are not authorized to log in as an admin" });
    }
  } else {
    // If no role is provided, find user by email only
    user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "No user exists with this email" });
    }
  }

  if (!user.isActivated) {
    return res.status(401).json({ message: "User account is not activated" });
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  sendToken(user, 200, res);
});


//Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()), //aile ko aile expire garauna
        httpOnly: true,
    })
    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});


//Forgot password
exports.forgotPassword = catchAsyncError(async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    //Get ResetPasswordToken();
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false }); //user model ma banathyo getResetaPasswordToken but save bhako xaina so tyo paila save gareko 

    const resetPasswordUrl = `http://localhost:3000/reset/${resetToken}`;

    const message=`Hey, ${user.name} Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not  requested this email then please ignore it`;
   

    try{
        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message,
        });
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`,
        })
    }
    catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        //yedi kei error ayo bhane token ra expiration undefined garera save garihalne tatkal
        return next(new ErrorHandler(error.message,500));
    }
});

//Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
  
    const user = await User.findOne({
      resetPasswordToken,
    });
  
    if (!user) {
      return next(new ErrorHandler('Reset Password Token is invalid', 404));
    }
  
    // Check if the reset password token has expired
    if (user.resetPasswordExpire && user.resetPasswordExpire < Date.now()) {
      return next(new ErrorHandler('Reset Password Token has expired', 400));
    }
  
    // Verify if the password fields are not empty and match
    if (!req.body.password || !req.body.confirmPassword) {
      return next(new ErrorHandler('Password fields cannot be empty', 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password doesn't match", 400));
    }
  
    // Update the user's password and reset token fields
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  
    await user.save();
    sendToken(user, 200, res);
  });
  

//Get User Details
exports.getUserDetails=catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    });
})

//Update User Password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const isPasswordMatched = await user.comparePassword(req.body.currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Old Password is Incorrect', 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesn't match", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});


//Update User Profile
exports.updateProfile=catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
    };
    const user =await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success:true,
    });
});

//Get all Users (admin)
exports.getAllUsers=catchAsyncError(async(req,res,next)=>{
    const users =await User.find();
    res.status(200).json({
        success:true,
        users,
    });
});

//Get Single User (admin)
exports.getSingleUser=catchAsyncError(async(req,res,next)=>{
    const user =await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User doesn't exit with ID: ${req.params.id}`))
    };
    res.status(200).json({
        success:true,
        user,
    });
});

//Update User Role(Admin)
exports.updateRole=catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    };
    const user =await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });
    if(!user)
    {
        return next(new ErrorHandler(`User doesn't exist with ID: ${req.params.id}`));
    }
    res.status(200).json({
        success:true,
    });
});

//Delete User(Admin)
exports.deleteUser=catchAsyncError(async(req,res,next)=>{
    //we will remove cloudinary later
    const user=await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(`User doesn't exist with ID: ${req.params.id}`));
    }

    await user.deleteOne();
    res.status(200).json({
        success:true,
        message:"User deleted Successfully"
    });
});

exports.isAuthenticated=catchAsyncError(async (req, res) => {
    const token = req.cookies.token;
    if (token) {
      try {
        // Verify the token and extract the necessary information
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE);

        const userId = decoded.userId;
        
        // Perform any additional checks or validations if needed
  
        // User is authenticated
        return res.status(200).json({
          success: true,
          message: 'User is authenticated',
          userId: userId,
        });
      } catch (error) {
        // Token verification failed, indicating that the user is not authenticated
        return res.status(401).json({
          success: false,
          message: 'User is not authenticated',
        });
      }
    } else {
      // Token is missing, indicating that the user is not authenticated
      return res.status(401).json({
        success: false,
        message: 'User is not authenticated',
      });
    }
  });

exports.isAdmin=catchAsyncError(async (req, res) => {
    const token = req.cookies.token;
    if (token) {
      try {
        // Verify the token and extract the necessary information
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE);

        const user = await User.findById(decoded.id);
        // Perform any additional checks or validations if needed
        
        // User is authenticated
        return res.status(200).json({
          success: true,
          role: user.role,
        });
      } catch (error) {
        // Token verification failed, indicating that the user is not authenticated
        return res.status(401).json({
          success: false,
          message: 'User is not authenticated',
        });
      }
    } else {
      // Token is missing, indicating that the user is not authenticated
      return res.status(401).json({
        success: false,
        message: 'User is not authenticated',
      });
    }
  });


