import express from "express";
import dotenv from "dotenv";
import coursesRouter from "./routers/coursesRouter.js";
import lessonsRouter from "./routers/lessonsRouter.js";
dotenv.config();

//constant variables
const PORT = process.env.PORT;

const app = express();

// middlewares
app.use(express.json())

app.get("/health", (request, response, next) => {
    response.status(200).json({
        success: true,
        data: null,
        message: "Server is healthy!"
    })
})

// add all the routers to the middleware (app.use())
app.use("/api/v1/courses", coursesRouter)
app.use("/api/v1/lessons", lessonsRouter)

app.listen(PORT, () => {
    console.log("HTTP Server has been started! at port: ", PORT);
})