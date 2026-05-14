const notFoundHandler = (req ,res, _next) => {
    res.status(404).json({
        success: false,
        data: null,
        message: `Request ${req.method}: ${req.originalUrl} is not found.`
    })
}

export {notFoundHandler}