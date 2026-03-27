import Users from "../db/Users.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt-tokens.js";
import jwt from "jsonwebtoken";

const usersInstance = new Users();

const registerNewUser = (request, response) => {
    try{
        const newUserData = request.body;
        // save the new user data in database. (users table)
        const savedUser = usersInstance.createNewUser(newUserData);
        response.status(201).json({
            success:true,
            data: savedUser,
            message: "New user has been saved successfully!"
        });
    }catch(error){
        response.status(400).json({
            success: false,
            error: error,
            message: error.message
        })
    }
}

const logInUser = (request, response) => {
    try{
        const userToLogIn = request.body;
        // get the existing user via user email while logging in
        const existingUserData = usersInstance.getUserByEmail(userToLogIn.email)

        if(!existingUserData){
            throw new Error("Email is wrong or User not found!")
        }

        // to save the user data inside the gibberish token string - for authentication and authorization purposes
        const accessToken = generateAccessToken(existingUserData.id);
        const refreshToken = generateRefreshToken(existingUserData.id);

        // save the refreshToken key value in user object

        const isProduction = process.env.NODE_ENVIRONMENT === "production" ? true : false;

        // set the cookie : refreshToken
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
            error: error,
            message: error.message
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