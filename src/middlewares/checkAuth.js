import jwt from "jsonwebtoken";

const checkAuth = (request, response, next) => {
    try {
        // TODO: discuss about why we should use Bearer while we send Authorization header with the request
        const accessToken = request.headers.authorization.split(" ")[1];
        console.log(accessToken);

        const decodedUserData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        console.log("Decoded Data: ", decodedUserData);

        request.user = decodedUserData;
        next();
    } catch (error) {
        response.status(401).json({
            success: false,
            error: error?.message,
            message: "User not authorized!"
        })
    }

}

export default checkAuth;