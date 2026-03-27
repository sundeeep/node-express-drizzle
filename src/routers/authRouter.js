import {Router} from "express";
import { logInUser, registerNewUser, refreshAccessToken } from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/register", registerNewUser);
authRouter.post("/login", logInUser);
authRouter.get("/refresh", refreshAccessToken)


export default authRouter;