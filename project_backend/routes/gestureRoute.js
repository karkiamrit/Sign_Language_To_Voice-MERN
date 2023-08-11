// const express = require('express');
// const router = express.Router();
// const Gesture = require('../model/gestureModel');

// // POST route to store gesture data with username, gestures, and image data
// router.post('/storegesture', async (req, res) => {
//   const { userName, gestures, photoDataURL } = req.body;
//   if (!userName || !gestures || gestures.length === 0 || !photoDataURL) {
//     return res.status(400).json({ success: false, message: 'Invalid data provided' });
//   }

//   try {
//     const gestureData = new Gesture({
//       userName: userName,
//       gestures: gestures,
//       photoDataURL: photoDataURL, // Save the image data in the database
//     });

//     await gestureData.save();
//     return res.status(200).json({ success: true, message: 'Gestures stored successfully' });
//   } catch (error) {
//     console.error('Error storing gestures:', error);
//     return res.status(500).json({ success: false, message: 'Error storing gestures' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const Gesture = require('../model/gestureModel');
const mongoose = require('mongoose');

// Configure multer to store uploaded files in a specific directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../my-app/public/images'); // Change 'uploads/' to your desired directory path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Define the file filter function to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

// Configure multer with the storage and file filter options
const upload = multer({ storage: storage, fileFilter: fileFilter });

// POST route to store gesture data with username, gestures, and image data
router.post('/storegesture', upload.single('photo'), async (req, res) => {
  const { userName, gestures, facilitator } = req.body;
  const photoFile = req.file;

  if (!userName || !gestures || gestures.length === 0 || !photoFile) {
    return res.status(400).json({ success: false, message: 'Invalid data provided' });
  }

  try {
    const gestureData = new Gesture({
      userName: userName,
      gestures: JSON.parse(gestures), // Convert the gestures back to an array
      facilitator: facilitator,
      photoDataURL: photoFile.path.replace('..\\my-app\\public', ''), // Save the file path of the uploaded image
    });

    await gestureData.save();
    return res.status(200).json({ success: true, message: 'Gestures and photo data stored successfully' });
  } catch (error) {
    console.error('Error storing gestures and photo data:', error);
    return res.status(500).json({ success: false, message: 'Error storing gestures and photo data' });
  }
});

router.get('/admin/gestures', async (req, res) => {
  const gestures = await Gesture.find();

  res.status(200).json({
    success: true,
    gestures,


  });
})

router.put('/admin/gesture/:id', async (req, res, next) => {
  const newGestureData = {
    userName: req.body.userName,
    gestures: req.body.gestures
  };
  const gesture = await Gesture.findByIdAndUpdate(req.params.id, newGestureData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  if (!gesture) {
    return next(new ErrorHandler(`Gesture doesn't exist with ID: ${req.params.id}`));
  }
  res.status(200).json({
    success: true,
  });
});

router.delete('/admin/gesture/:id', async (req, res, next) => {
  const gesture=await Gesture.findById(req.params.id);

  if(!gesture)
  {
      return next(new ErrorHandler(`Gesture doesn't exist with ID: ${req.params.id}`));
  }

  await gesture.deleteOne();
  res.status(200).json({
      success:true,
      message:"Gesture deleted Successfully"
  });
});


router.get('/admin/gesture/:identifier', async (req, res) => {
  const identifier = req.params.identifier;

  let gesture;
  if (mongoose.isValidObjectId(identifier)) {
    // If the identifier is a valid ObjectId, search by id
    gesturedata = await Gesture.findById(identifier);
    gesture = [gesturedata]

  } else {
    // Otherwise, search by username
    gesture = await Gesture.find({ userName: identifier });
  }

  if (!gesture) {
    return res.status(404).json({ success: false, message: 'Gesture not found' });
  }

  res.status(200).json({
    success: true,
    gesture,
  });
});

module.exports = router;

