import mongoose, {Schema} from "mongoose";

const allDetailsSchema = new Schema({
    experience:{
        type:String,    
    },
    subject:[
        {
            type:String,  
        }
    ],
    Class:{
        type:String,
    },
    section:{
        type: String,
    },
},{timestamps:true});

export const AllDetails = mongoose.model("AllDetails", allDetailsSchema); 