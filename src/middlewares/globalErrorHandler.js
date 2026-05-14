

export const globalErrorHandler = (error, request, response, _next) => {
    console.error(`ERROR: ${request.method} : ${request.path}`, error);

    response.status(400).json({
        success: false,
        error: error.message,
        message: error.message
    })
}
