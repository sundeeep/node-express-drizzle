import Courses from "../db/Courses.js"
import { asyncHandler } from "../utils/asyncHandler.js"; 

const coursesInstance = new Courses();

const createNewCourse = asyncHandler(async(req, res) => {
    console.log(req.body);
    if(!req.body.courseName){
        throw new Error("courseName is required!")
    }
    // call the service function
    res.status(201).json({
        success: true,
        message: "new course is created",
        data: req.body
    })
})

const createCourse = (request, response) => {
    try {
        if(!request.body){
            throw new Error("Request body hasn't been parsed!")
        }

        const newCourse = request.body;
        const userId = request?.user?.userId;
        
        if(!userId){
            response.status(401).json({
                success: false,
                message: "user unauthorised"
            })
        }
        
        newCourse.userId = userId
        
        if(!newCourse.name){
            throw new Error("name for the course to create one, should be required!")
        }

        const createdNewCourse = coursesInstance.createCourse(newCourse)
        
        if(!createdNewCourse.id){
            throw new Error("course hasn't been created, please try again!")
        }

        response.status(200).json({
            success:true,
            data: createdNewCourse,
            message: "couse has been created successfully!"
        })
    } catch (error) {
        response.status(400).json({
            success: false,
            error: error,
            message: error.message
        })
    }
}
const getAllCourses = (request, response) => {
    response.status(200).json({
        success: true,
        data: coursesInstance.courses,
        messages: "Courses have been fetched, successfully!"
    })
}
const getCourseById = (request, response) => {
    try {
        const courseId = request.params.courseId
        const courseWithCourseId = coursesInstance.getCourseById(courseId);
        if(!courseWithCourseId){
            throw new Error("Course doesn't exist with this id!")
        }
        response.status(200).json({
            success:true,
            data: courseWithCourseId,
            message: "couse with id has been fetched successfully!"
        })
    } catch (error) {
        response.status(400).json({
            success: false,
            error: error,
            message: error.message
        })
    }
}

export {
    getAllCourses,
    createCourse,
    getCourseById,
    createNewCourse
}