// http
import express, { response } from "express"; // module import
// const express = require("express"); // comonjs import

const app = express();



app.post("/books/:id", (request, response) => {
    const params = request.params;
    response.status(200).json({
        message: "Home Route Registered / POST",
        params: params
    })
})

app.post("/:id/hello", (request, response) => {
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

app.listen(8000, () => console.log("Server is running at port: 8000"));