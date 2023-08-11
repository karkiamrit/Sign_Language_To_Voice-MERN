const ErrorHandler=require('../utils/errorhandler');
module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode ||500; //default 500, if none provided, it will be set to 500.
    err.message=err.message || 'Internal Server Error';

    if(err.name=='CastError'){
        const message=`Resource not found,Invalid ${err.path}`;
        err=new ErrorHandler(message,400);
    }

    if(err.code==11000){
        const message=`Duplicate ${Object.keys(err.keyValue)} Entered`;
        err=new ErrorHandler(message,400); //default 400, if none provided, it will be set to 400.
    }

    if(err.name=='JsonWebTokenError'){
        const message =`Json Web Token is invalid, please try again`;
        err=new ErrorHandler(message,400); //default 400, if none provided, it will be set to 400.
    }
    if(err.name=='TokenExpireError'){
        const message=`Token has Expired, please sign in again`; //default 400, if none provided, it will be set to 400.
        err=new ErrorHandler(message,400); //default 400, if none provided, it will be set to 400.
    }
    res.status(err,statusCode).json({
        success:false,
        message:err.message,
    });

};
