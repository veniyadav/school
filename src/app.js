import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import fileUpload from "express-fileupload"; // ✅ Add this line

dotenv.config();
const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));

// ✅ File Upload middleware setup
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

import userRouter from "./Routers/User.route.js";
import CategoryPaper from "./Routers/CategoryPaper.route.js";
import QuestionPaper from "./Routers/QuestionPaper.route.js";
import Result from "./Routers/Result.route.js";
import ExamRouter from "./Routers/ExamRouter.js";

app.use("/api", userRouter);
app.use("/api", CategoryPaper);
app.use("/api", QuestionPaper);
app.use("/api", Result);
app.use("/api", ExamRouter);

export { app };
