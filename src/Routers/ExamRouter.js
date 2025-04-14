import { Router } from "express";
import { createExam, getExam } from "../Controllers/ExamCtrl.js";

const router = Router()

router.route("/exam/submit").post(createExam);
router.route("/exam/submit").get(getExam);


export default router