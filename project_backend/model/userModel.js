const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const crypto=require('crypto'); //crypto for password encryption


const userSchema=new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name should not exceed 30 characters"],
    minLength: [2, "Name should be more than 2 characters"]
},
email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"]
},
password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    select: false, //find() method call garda password dekhaudeina aba both to user and admin
    minLength: [8, "Password should be more than 8 characters"]
},
role: {
    type: String,
    default: "user"
},
otp: {
  type: String
},
isActivated: {
  type: Boolean,
  default: false,
},
resetPasswordToken: String,
resetPasswordExpire: Date,
}
);

userSchema.pre("save",async function(next){
  if(!this.isModified("password")){
    next();
  }
  this.password=await bcrypt.hash(this.password,10); //10 is the cost factor for hashing. 10 means round to nearest whole number.
});

userSchema.methods.getJWTToken=function(){
  return jwt.sign({id:this._id},process.env.JWT_PRIVATE,{
    expiresIn:process.env.JWT_EXPIRE //how long the token should be valid. 60 * 60 * 1000 = 1 hour.
  });
};

userSchema.methods.comparePassword=async function(enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password); //this method is async. So we need to await it.
};

userSchema.methods.getResetPasswordToken=function(){
  const resetToken=crypto.randomBytes(20).toString("hex"); 
  this.resetPasswordToken=crypto
              .createHash("sha256")
              .update(resetToken) //using SHA-256 hash algorithm to hash the token.
              .digest('hex');
              this.resetPasswordTokenExpire=Date.now()+10000; //10,000 ms is the default password reset token expiry time. 
              return resetToken;
};

module.exports=mongoose.model("User",userSchema);
      



