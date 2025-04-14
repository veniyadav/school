import mongoose, {Schema} from "mongoose";


const questionPaperSchema = new Schema({
    examId: {
        type: String,
        required: true,
       
    },
    question: {
        type: String,
        required: true,
       
    },
    option1: {
        type: String,
        required: true,
       
    },
    option2: {
        type: String,
        required: true,
       
    },
    option3: {
        type: String,
        required: true,
       
    },
    option4: {
        type: String,
        required: true,
       
    },
    correctAnswer: {
        type: String,
        required: true,
       
    },
    category:{
        type: String,
        required: true,
    },
    // time:{
    //     type: String,
    //     required: true,
    // }
  
}, {timestamps: true})

export const QuestionPaper = mongoose.model("QuestionPaper", questionPaperSchema);