import { Router } from "express";
import {
  createCategoryPaper,
  getCategoryPaper,
  deletecategory,
  updatecategory
} from "../Controllers/CategoryPaper.controller.js";

const router = Router();

router.route("/category/createCategory").post(createCategoryPaper);
router.route("/category").get(getCategoryPaper);
router.patch('/category/:id', updatecategory);
router.delete('/category/:id', deletecategory);

export default router;
