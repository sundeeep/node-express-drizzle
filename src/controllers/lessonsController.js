
const lessons = []

const getAllLessons = (request, response, next) => {
    response.status(200).json({
        success: true,
        data: lessons,
        messages: "Lessons have been fetched, successfully!"
    })
}

export {
    getAllLessons
}