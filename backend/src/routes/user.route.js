import  {Router} from "express";

import {registerUser,
    loginUser,
    loginAdmin
    // updateAccountDetails,
    // forgotPassword,
    // verifyResetToken,
    // resetPassword,
    // deleteUser,
    // logoutUser,
    // getProductsByCategory
} from '../controllers/user.controller.js';


import {verifyJWT} from '../middlewares/userAuth.middleware.js';

const userRoutes=Router();
userRoutes.post("/register",registerUser);
userRoutes.post("/login",loginUser);
userRoutes.post("/adminLogin",loginAdmin);

// userRoutes.patch("/updateDetails",verifyJWT,updateAccountDetails);
// userRoutes.post("/forgetPassword",forgotPassword);
// userRoutes.get("/resetPassword/:token",verifyResetToken);
// userRoutes.post("/resetPassword/:token",resetPassword);
// // userRoutes.get("/products/category/:category", getProductsByCategory);
// userRoutes.post("/logout",verifyJWT,logoutUser);
// userRoutes.delete("/delete",verifyJWT,deleteUser);

export default userRoutes;