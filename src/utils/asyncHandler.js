
const asyncHandler = (fn) => {
    return (req, res, next) => {
        //Promise.resolve(fn(req, res, next)).catch((error) => next(error))) // next(error)
        Promise.resolve(fn(req, res, next)).catch(next) // next(error)
        // next() -> (req, res, next) => {}
        // next(error) -> (error, req, res, next) => {}
    }
}

export {asyncHandler}