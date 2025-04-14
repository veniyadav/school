import mongoose, {Schema} from "mongoose";


const categoryPaperSchema = new Schema({
    name: {
        type: String,
        required: true,
       
    },
    description: {
        type: String,
       
    },
     time:{
        type: Number,
        required: true,
    },

    isPublish: {
        type: Boolean,
        default: false, // Default value set to false
    }


}, {timestamps: true})

export const CategoryPaper = mongoose.model("CategoryPaper", categoryPaperSchema)