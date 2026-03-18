// http
import express from "express"; // module import
// const express = require("express"); // comonjs import
import dotenv from "dotenv"; //package to loads environment variables from a .env file into process.env
import path from "path";
console.log(path.resolve(process.cwd(), '.env'))

dotenv.config(); // TODO: resolve the issue with path inside config
const PORT = process.env.PORT;

// console.log(process.env.PORT)
// console.log(import.meta.env.) //vite react application

const app = express();
app.use(express.json()) // middleware:  app.use(dosomething)

app.post("/books/:id", (request, response) => {
    const params = request.params;
    response.status(200).json({
        message: "Home Route Registered / POST",
        params: params
    })
})
app.put("users/:id", (request, response) => {
    const params = request.params;
    response.status(200).json({
        message: "Home Route Registered / GET",
        params: params
    })
})
app.post("/sundeeep", (request, response) => {
    response.status(200).json({
        message: "Home Route Registered /sundeeep POST"
    })
})
// http://localhost:8000/health-check
app.get("/health-check", (request, response) => {
    response.status(200).json({
        "message": "Welcome to backend class!"
    });
});

// http://localhost:800/teaching-request/:id
app.post("/teaching-request/:id", (request, response) => {
    console.log("this api: /teaching-request/:id has been hit!");
    console.log("Request Body: ",request.body)
    console.log("Request Params: ",request.params)
    response.status(200).json({
        request: {
            body: request.body,
            params: request.params,
            query: request.query
        },
        message: "Entire request object has been sent as response"
    })
})

//responsible for starting up http server on port number : 
app.listen(PORT, () => console.log("Server is running at port: ", PORT));