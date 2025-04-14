import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        first_name: {
            type: String,
            required: true,
            trim: true, 
          
        },
        last_name: {
            type: String,
            required: true,
            trim: true,
        },
       phone_number: {
            type: String,
       },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        role: {
            type: String,
            required: true,
        },
        status: {
            type: String,
        },

        qrcode: {
            type: String // This will store the Cloudinary URL
        },
        
        gender:{
           type: String,
        },

        refreshToken: {
            type: String
        },
        allDetails: {
            type: Schema.Types.ObjectId,
            ref: "AllDetails"
          }

    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)