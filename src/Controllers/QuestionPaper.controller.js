import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { get } from "http";
import { QuestionPaper } from "../Models/question.model.js";


export const createQuestionPaper = asyncHandler(async (req, res) => {
    const { question, option1, option2, option3, option4, category, correctAnswer,examId } = req.body;
    if (!question || !option1 || !option2 || !option3 || !option4 || !category || !correctAnswer|| !examId ) {
        throw new ApiError(400, "All fields are required");
    }
    const questionPaper = await QuestionPaper.create({
        question,
        option1,
        option2,
        option3,
        option4,
        correctAnswer,
        category,
        examId
        
    });
    return res.status(201).json(
        new ApiResponse(200, questionPaper, "Question Paper created successfully")
    );
}
);

export const getQuestionPaper = asyncHandler(async (req, res) => {
    const questionPaper = await QuestionPaper.find();
    return res.status(200).json(
        new ApiResponse(200, questionPaper, "Question Paper fetched successfully")
    );
}

);

export const updatequestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { question, option1, option2, option3, option4, category, correctAnswer, examId,time } = req.body;

    // Check if Question Paper exists
    const questionPaper = await QuestionPaper.findById(id);
    if (!questionPaper) {
        throw new ApiError(404, "Question Paper not found");
    }

    // Update fields if provided
    if (question) questionPaper.question = question;
    if (option1) questionPaper.option1 = option1;
    if (option2) questionPaper.option2 = option2;
    if (option3) questionPaper.option3 = option3;
    if (option4) questionPaper.option4 = option4;
    if (category) questionPaper.category = category;
    if (correctAnswer) questionPaper.correctAnswer = correctAnswer;
    if (examId) questionPaper.examId = examId;
    if (time) questionPaper.time = time;

    // Save updated document
    await questionPaper.save();

    return res.status(200).json(
        new ApiResponse(200, questionPaper, "Question Paper updated successfully")
    );
});

export const deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const questionPaper = await QuestionPaper.findById(id);
    if (!questionPaper) {
        throw new ApiError(404, "Question Paper not found");
    }

    await questionPaper.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "Question Paper deleted successfully")
    );
});