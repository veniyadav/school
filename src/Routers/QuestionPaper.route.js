import { Router } from "express";
import { createQuestionPaper,deleteQuestion,getQuestionPaper ,updatequestion} from "../Controllers/QuestionPaper.controller.js";

const router = Router()

router.route("/question/createQuestion").post(createQuestionPaper);
router.route("/question").get(getQuestionPaper);
router.put('/question/:id', updatequestion);
router.delete('/question/:id', deleteQuestion);


export default router