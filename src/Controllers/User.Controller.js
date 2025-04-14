import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../Models/User.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { AllDetails } from "../Models/Subject.model.js";

import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
cloudinary.config({
    cloud_name: 'dkqcqrrbp',
    api_key: '418838712271323',
    api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});




const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;

    if (
        [first_name, last_name, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    const user = await User.create({
        first_name,
        last_name,
        email,
        password,
        role
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const createTeacher = asyncHandler(async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password,
        role,
        subject,
        phone_number,
        gender,
        experience,
        Class,
        status,
        section
    } = req.body;

    if ([first_name, last_name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    const user = await User.create({
        first_name,
        last_name,
        email,
        password,
        role,
        phone_number,
        gender,
        status
    });

    const details = await AllDetails.create({
        experience,
        subject,
        Class,
        section
    });

    user.allDetails = details._id;
    await user.save();

    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken")


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, "Teacher Created successfully")
    );
});


const createStudent = asyncHandler(async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password,
        role,
        phone_number,
        gender,
        Class,
        section,
        status
    } = req.body;

    if (
        [first_name, last_name, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All required fields must be filled");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    let qrcodeUrl = "";

    if (req.files && req.files.qrcode) {
        const qrcodeUpload = await cloudinary.uploader.upload(
            req.files.qrcode.tempFilePath || req.files.qrcode.path,
            {
                folder: "student-qrcodes"
            }
        );
        qrcodeUrl = qrcodeUpload.secure_url;
    }

    const user = await User.create({
        first_name,
        last_name,
        email,
        password,
        role,
        phone_number,
        gender,
        status,
        qrcode: qrcodeUrl || undefined
    });

    const details = await AllDetails.create({
        Class,
        section
    });

    user.allDetails = details._id;
    await user.save();

    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken")
        .populate("allDetails");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "Student Created Successfully")
    );
});



const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email) {
        throw new ApiError(400, "email is required")
    }


    const user = await User.findOne({
        $or: [{ email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body



    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }

    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const getAllTeacher = asyncHandler(async (req, res) => {
    const allTeacher = await User.find({ role: "teacher" })
        .select("-password -refreshToken")
        .populate("allDetails");

    if (!allTeacher || allTeacher.length === 0) {
        throw new ApiError(400, "No teacher found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, allTeacher, "All teachers fetched successfully"));
});

const getAllStudent = asyncHandler(async (req, res) => {
    const allStudent = await User.find({ role: "student" })
        .select("-password -refreshToken")
        .populate("allDetails");

    if (!allStudent || allStudent.length === 0) {
        throw new ApiError(400, "No student found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, allStudent, "All students fetched successfully"));
});

const updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
        first_name,
        last_name,
        email,
        phone_number,
        gender,
        Class,
        section,
        status,
        role
    } = req.body;

    // Find and update the user in one go
    const user = await User.findByIdAndUpdate(
        id,
        {
            ...(first_name && { first_name }),
            ...(last_name && { last_name }),
            ...(email && { email }),
            ...(phone_number && { phone_number }),
            ...(gender && { gender }),
            ...(status && { status }),
            ...(role && { role })
        },
        { new: true }  // return the updated document
    );

    if (!user) {
        throw new ApiError(404, "Student not found");
    }

    // Update or create AllDetails record
    let details;
    if (user.allDetails) {
        details = await AllDetails.findByIdAndUpdate(
            user.allDetails,
            {
                ...(Class && { Class }),
                ...(section && { section })
            },
            { new: true }
        );
    } else {
        details = await AllDetails.create({ Class, section });
        user.allDetails = details._id;
        await user.save();
    }

    return res.status(200).json(
        new ApiResponse(200, "Student updated successfully")
    );
});

const deleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "Student not found");
    }

    // Also delete associated AllDetails
    if (user.allDetails) {
        await AllDetails.findByIdAndDelete(user.allDetails);
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, "Student deleted successfully")
    );
});

export {
    registerUser,
    createTeacher,
    createStudent,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    getAllTeacher,
    getAllStudent,
    updateStudent,
    deleteStudent
}