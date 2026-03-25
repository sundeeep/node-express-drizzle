import {Router} from "express";
import { getAllLessons } from "../controllers/lessonsController.js";

const lessonsRouter = Router();

// http://localhost:8000/api/v1/lessons
lessonsRouter.get("/", getAllLessons)

export default lessonsRouter;