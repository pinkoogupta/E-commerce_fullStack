import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";



export const verifyJWT=async(req,res,next)=>{
  

   const {token}=req.headers;
 
   if(!token){
    return res.json({success:false,message:"token is not found"});
    
   }
   try {
 const decodedToken= jwt.verify(token,process.env.JWT_SECRET)
//  if(decodedToken)
//   {
//     res.json({decodedToken});
//   }  
req.body.userId=decodedToken._id;
next();

  } catch (error) {
    return res.josn({success:false,message:error?.message || "invalid access token"});
  
  }

};


