import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CategoryPaper } from "../Models/Pepar.model.js";
import { get } from "http";


export const createCategoryPaper = asyncHandler(async (req, res) => {
    const { name, description, time } = req.body;
    if (!name || !description || !time) {
        throw new ApiError(400, "All fields are required");
    }
    const categoryPaper = await CategoryPaper.create({
        name,
        description,
        time
    });
    return res.status(201).json(
        new ApiResponse(200, categoryPaper, "CategoryPaper created successfully")
    );
}
);

export const getCategoryPaper = asyncHandler(async (req, res) => {
    const categoryPaper = await CategoryPaper.find();
    return res.status(200).json(
        new ApiResponse(200, categoryPaper, "CategoryPaper fetched successfully")
    );
}
);

export const updatecategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, time, isPublish } = req.body;
  
    const categoryPaper = await CategoryPaper.findById(id);
    if (!categoryPaper) {
      throw new ApiError(404, "CategoryPaper not found");
    }
  
    categoryPaper.name = name || categoryPaper.name;
    categoryPaper.description = description || categoryPaper.description;
    categoryPaper.time = time || categoryPaper.time;

    if (typeof isPublish !== "undefined") {
      categoryPaper.isPublish = isPublish === "true" || isPublish === true;
    }
      
    await categoryPaper.save();
  
    return res.status(200).json(
      new ApiResponse(200, categoryPaper, "CategoryPaper updated successfully")
    );
  });
  
  // Delete CategoryPaper
  export const deletecategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
  
    const categoryPaper = await CategoryPaper.findById(id);
    if (!categoryPaper) {
      throw new ApiError(404, "CategoryPaper not found");
    }
  
    await categoryPaper.deleteOne();
  
    return res.status(200).json(
      new ApiResponse(200, null, "CategoryPaper deleted successfully")
    );
  });
  
