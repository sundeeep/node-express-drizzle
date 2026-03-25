import {Router} from "express";
import { createCourse, getAllCourses, getCourseById } from "../controllers/coursesController.js";

const coursesRouter = Router();

// http://localhost:8000/api/v1/courses
coursesRouter.post("/", createCourse)
coursesRouter.get("/", getAllCourses)
coursesRouter.get("/:courseId", getCourseById)

export default coursesRouter;