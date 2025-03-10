import  {Router} from "express";

import {registerUser,
    loginUser,
    loginAdmin,
    forgetPassword,
    verifyResetToken,
    resetPassword,
    // deleteUser,
} from '../controllers/user.controller.js';
import {verifyJWT} from '../middlewares/userAuth.middleware.js';


const userRoutes=Router();
userRoutes.post("/register",registerUser);
userRoutes.post("/login",loginUser);
userRoutes.post("/adminLogin",loginAdmin);

// userRoutes.patch("/updateDetails",verifyJWT,updateAccountDetails);
userRoutes.post("/forgetPassword",forgetPassword);
userRoutes.get("/verifyPassword/:token",verifyResetToken);
userRoutes.post("/resetPassword/:token",resetPassword);


// userRoutes.delete("/delete",verifyJWT,deleteUser);

export default userRoutes;