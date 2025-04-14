// controllers/submitExam.js

import { asyncHandler } from "../utils/AsyncHandler.js";
import { Exam } from "../Models/Exam.model.js";
//import { Submission } from "../Models/Submission.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const submitExam = asyncHandler(async (req, res) => {
  const { examId, answers, studentId } = req.body;

  if (!examId || !Array.isArray(answers)) {
    throw new ApiError(400, "Invalid submission data");
  }

  
  // Log to check if the correct examId and studentId are being passed
  console.log("Exam ID:", examId);
  console.log("Student ID:", studentId);

  // Check if the student has already submitted the exam
  // const alreadySubmitted = await Exam.findOne({ 
  //   examId: mongoose.Types.ObjectId(examId),  // Ensure to cast to ObjectId
  //   studentId: mongoose.Types.ObjectId(studentId)  // Ensure to cast to ObjectId
  // });

  // if (alreadySubmitted) {
  //   return res.status(400).json(
  //     new ApiResponse(400, null, "You have already submitted this exam.")
  //   );
  // }
  
  const exam = await Exam.findById(examId);
  if (!exam) throw new ApiError(404, "Exam not found");

  let score = 0;
  const answerReview = [];

  answers.forEach((ans, index) => {
    const question = exam.questions[index];
    const isCorrect = question && ans.selectedIndex === question.correctIndex;
    if (isCorrect) score += 1;

    answerReview.push({
      questionIndex: index,
      numbers: question.numbers,
      options: question.options,
      correctIndex: question.correctIndex,
      selectedIndex: ans.selectedIndex,
      isCorrect
    });
  });

  const submission = await Submission.create({
    examId,
    studentId,
    answers: answerReview,
    score
  });

  return res.status(200).json(
    new ApiResponse(200, {
      submissionId: submission._id,
      score,
      totalQuestions: exam.questions.length,
      answerReview,
    }, "Exam submitted and saved successfully")
  );
});



  export const getSubmissionsByStudentId = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
  
    if (!studentId) {
      throw new ApiError(400, "Student ID is required");
    }
  
    const submissions = await Submission.find({ studentId })
      .populate("examId", "title timing") // Optional: to get exam title and timing
      .sort({ submittedAt: -1 });
  
    if (!submissions || submissions.length === 0) {
      throw new ApiError(404, "No submissions found for this student");
    }
  
    return res.status(200).json(
      new ApiResponse(200, {
        totalSubmissions: submissions.length,
        submissions
      }, "Submissions fetched successfully")
    );
  });
