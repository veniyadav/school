import mongoose, { Schema } from "mongoose"

const studentAnswerSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        type: String,
        ref: 'Exam',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        type: String,
        ref: 'User',
        required: true
    },
    answers: {
        type: [],
        required: true
    },

}, { timestamps: true });

export const ExamSubmit = mongoose.model('examsubmits', studentAnswerSchema);
