/**
 * class -> properties(variables), behaviour(functions/methods)
 * class can extend another class(existing)
 */
// throw new Error(errMsg) -> next(error)
// throw new AppError(errMsg, statusCode) - instantiate -> next(appError) -> appError.message, appError.statusCode
export class AppError extends Error{
    constructor(errorMessage, statusCode){
        super(errorMessage) //new Error(errorMessage)
        this.statusCode = statusCode
        this.isOperational = true
    }
}

export const globalErrorHandler = (error, request, response, _next) => {
    console.error(`ERROR: ${request.method} : ${request.path}`, error);

    response.status(error.statusCode).json({
        success: false,
        error: error.message,
        message: error.message
    })
}
