import { Router } from "express";
import { createResult, getResult } from "../Controllers/Result.controller.js";


const router = Router()

router.route("/result/createResult").post(createResult);
router.route("/result").get(getResult);


export default router