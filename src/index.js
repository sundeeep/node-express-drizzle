import express from "express";
import dotenv from "dotenv";
dotenv.config();

import coursesRouter from "./routers/coursesRouter.js";
import lessonsRouter from "./routers/lessonsRouter.js";
import authRouter from "./routers/authRouter.js";
import cookieParser from "cookie-parser";

//constant variables
const PORT = process.env.PORT;
const app = express();

console.log("Inside index.js");

// middlewares
app.use(cookieParser()) // to accept the cookies from the every request
app.use(express.json()) // to accept the body from the every request

app.get("/health", (request, response, next) => {
    response.status(200).json({
        success: true,
        data: null,
        message: "Server is healthy!"
    })
})

// add all the routers to the middleware (app.use())
// console.log(typeof authRouter) // function with properties - handler
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/courses", coursesRouter)
app.use("/api/v1/lessons", lessonsRouter)

app.listen(PORT, () => {
    console.log("HTTP Server has been started! at port: ", PORT);
})