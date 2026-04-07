import Users from "../db/Users.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt-tokens.js";
import jwt from "jsonwebtoken";

const usersInstance = new Users(); // instantiation of class "User": calling the constructor function

const registerNewUser = async (request, response) => {
    try{
        const newUserData = request.body;

        // Validate required fields
        if (!newUserData.name || !newUserData.email) {
            throw new Error("Name and email are required!");
        }

        // Check if user already exists
        const existingUser = await usersInstance.getUserByEmail(newUserData.email);
        if(existingUser){
            throw new Error("User with this email already exists!");
        }

        // Save the new user data in database
        const savedUser = await usersInstance.createNewUser(newUserData);
        if(!savedUser){
            throw new Error("User not saved in db! Try again.")
        }

        response.status(201).json({
            success: true,
            data: savedUser,
            message: "New user has been saved successfully!"
        });
    }catch(error){
        console.error("Register error:", error);
        response.status(400).json({
            success: false,
            error: error?.message,
            message: error?.message
        })
    }
}

const logInUser = async (request, response) => {
    try{
        const userToLogIn = request.body;

        // Validate required fields
        if (!userToLogIn.email) {
            throw new Error("Email is required!");
        }

        // Get the existing user via user email while logging in
        const existingUserData = await usersInstance.getUserByEmail(userToLogIn.email)

        if(!existingUserData){
            throw new Error("Email is wrong or User not found!")
        }

        // Generate tokens for authentication and authorization
        const accessToken = generateAccessToken(existingUserData.id);
        const refreshToken = generateRefreshToken(existingUserData.id);

        // TODO: Save the refreshToken in user record in database
        // await usersInstance.saveTheRefreshToken(existingUserData.id, refreshToken);

        const isProduction = process.env.NODE_ENVIRONMENT === "production" ? true : false;

        // Set the cookie with refreshToken
        response.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction ? true : false,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7days
        })

        response.status(200).json({
            success: true,
            data: {
                loggedInUserData: existingUserData,
                accessToken
            }
        })
    }catch(error){
        response.status(400).json({
            success: false,
            error: error?.message,
            message: error?.message
        })
    }
}

const refreshAccessToken = (request, response) => {
    try {
        const refreshToken = request.cookies.refreshToken;
        if(!refreshToken){
            // get it from the user table record
        }
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const newAccessToken = generateAccessToken(decodedRefreshToken.userId)

        response.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken
            },
            message: "user auth refreshed successfully!"
        })
    } catch (error) {
        response.status(401).json({
            success: false,
            error: error?.message,
            message: "User unauthorised"
        })
    }
}

export {
    registerNewUser,
    logInUser,
    refreshAccessToken
}