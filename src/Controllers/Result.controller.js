import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { get } from "http";
import { Result } from "../Models/Result.model.js";


export const createResult = asyncHandler(async (req, res) => {
    const { student_id, totalQuestions, correctAnswers, attemptedQuestions, unAttemptedQuestions, wrongAnswers, score, category} = req.body;
    if (!student_id || !totalQuestions || !correctAnswers || !attemptedQuestions || !unAttemptedQuestions || !wrongAnswers || !score || !category) {
        throw new ApiError(400, "All fields are required");
    }
    const result = await Result.create({
        student_id,
        totalQuestions,
        correctAnswers,
        attemptedQuestions,
        unAttemptedQuestions,
        wrongAnswers,
        score,
        category
    });
    return res.status(201).json(
        new ApiResponse(200, result, "Result created successfully")
    );
}
);

export const getResult = asyncHandler(async (req, res) => {
    const result = await Result.find();
    return res.status(200).json(
        new ApiResponse(200, result, "Result fetched successfully")
    );
}
);
