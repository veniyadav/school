import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ExamSubmit } from "../Models/ExamModel.js";

export const createExam = asyncHandler(async (req, res) => {
    const { examId, studentId, answers } = req.body;

    if (!examId || !studentId || !answers || !Array.isArray(answers)) {
        throw new ApiError(400, "examId, studentId, studentName , examName ,and answers (array) are required");
    }

    // Check if the student has already submitted the exam
    const existingSubmission = await ExamSubmit.findOne({ examId, studentId });

    if (existingSubmission) {
        // If the exam has already been submitted by the student, return an error
        return res.status(400).json(
            new ApiResponse(400, "You have already submitted this exam.")
        );
    }

    const submittedExam = await ExamSubmit.create({
        examId,
        studentId,
        answers,
    });

    return res.status(201).json(
        new ApiResponse(201, submittedExam, "Exam submitted successfully")
    );
});


export const getExam = asyncHandler(async (req, res) => {
    const submittedExams = await ExamSubmit.aggregate([
        {
            $addFields: {
                examObjectId: { $toObjectId: "$examId" },
                studentObjectId: { $toObjectId: "$studentId" }
            }
        },
        {
            $lookup: {
                from: "categorypapers",
                localField: "examObjectId",
                foreignField: "_id",
                as: "examData"
            }
        },
        { $unwind: "$examData" },
        {
            $lookup: {
                from: "users",
                localField: "studentObjectId",
                foreignField: "_id",
                as: "studentData"
            }
        },
        { $unwind: "$studentData" },
        {
            $lookup: {
                from: "questionpapers",
                localField: "examId",
                foreignField: "examId",
                as: "questionsList"
            }
        }
    ]);

    const filterData = submittedExams.map((result) => {
        const answers = result.answers;
        const questions = result.questionsList;

        let correctCount = 0;
        let wrongCount = 0;

        if (Array.isArray(questions) && Array.isArray(answers)) {
            answers.forEach((answer) => {
                const question = questions[answer.questionIndex];
                if (question && question[`option${answer.selectedIndex + 1}`] === question.correctAnswer) {
                    correctCount++;
                } else {
                    wrongCount++;
                }
            });
        }

        const totalQuestions = questions.length;
        const percentage = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(2) : "0.00";

        return {
            _id: result._id,
            examId: result.examId,
            examName: result.examData.title || result.examData.name,
            studentId: result.studentId,
            studentName: `${result.studentData.first_name} ${result.studentData.last_name}`,
            totalQuestions,
            correctAnswers: correctCount,
            wrongAnswers: wrongCount,
            percentage: `${percentage}%`,
            answers
        };
    });

    return res.status(200).json(
        new ApiResponse(200, filterData, "Submitted exams with full analysis fetched successfully")
    );
});
