import { Router } from "express";
import { createStudent, createTeacher, getAllStudent, getAllTeacher, getCurrentUser, loginUser, logoutUser, registerUser,updateStudent,deleteStudent   } from "../Controllers/User.Controller.js";
import { verifyJWT } from "../Middleware/auth.middleware.js";
const router = Router()

router.route("/users/register").post( registerUser)
router.route("/users/login").post(loginUser)
// //secured routes
router.route("/users/logout").post(verifyJWT,  logoutUser)
router.route("/users/create_teacher").post(verifyJWT, createTeacher);
router.route("/users/create_student").post(verifyJWT, createStudent);
router.route("/users/current-user").get(verifyJWT, getCurrentUser);
router.route("/users/get_all_teacher").get(verifyJWT, getAllTeacher);
router.route("/users/get_all_student").get(verifyJWT, getAllStudent);
// router.route("/refresh-token").post(refreshAccessToken)
// router.route("/change-password").post(verifyJWT, changeCurrentPassword)
// router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.put('/user/:id', updateStudent);
router.delete('/user/:id', deleteStudent);


export default router