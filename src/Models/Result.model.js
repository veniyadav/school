import mongoose, {Schema} from "mongoose";


const resultSchema = new Schema({
    student_id: {
        type: String,
        required: true,
       
    },
    totalQuestions: {
        type: Number,
        required: true,
       
    },
    correctAnswers: {
        type: Number,
        required: true,
       
    },
    attemptedQuestions: {
        type: Number,
        required: true,
       
    },
    unAttemptedQuestions: {
        type: Number,
        required: true,
       
    },
    wrongAnswers: {
        type: Number,
        required: true,
       
    },
    score: {
        type: String,
        required: true,
       
    },
    category:{
        type: String,
        required: true,
    }
  
}, {timestamps: true})

export const Result = mongoose.model("Result", resultSchema);