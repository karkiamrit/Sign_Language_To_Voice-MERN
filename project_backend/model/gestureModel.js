const mongoose=require('mongoose');
const gestureDataSchema = new mongoose.Schema({
    userName: {
      type: String,
      required: true,
    },
    gestures: {
      type: [String],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    facilitator:{
      type:String,
      required:true,

    },

    photoDataURL: {
      type: String, // Store the base64-encoded image data
      required: true,
    },
  });

  module.exports=mongoose.model("Gesture",gestureDataSchema);