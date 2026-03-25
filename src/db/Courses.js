import { v4 as uuidv4 } from 'uuid';

class Courses {
    constructor() {
        this.courses = []; //array of objects
    }

    createCourse(newCourse) {
        newCourse.id = uuidv4();
        const courseWithSameName = this.courses.find((course) => course.name === newCourse.name);
        if(courseWithSameName !== undefined){
            throw new Error("course with the same name already, exists!")
        }
        this.courses.push(newCourse);
        return newCourse;
    }

    getAllCourses() {
        return this.courses;
    }

    getCourseById(courseId) {
        const courseWithId = this.courses.find((course) => course.id === courseId);
        return courseWithId;
    }
}

export default Courses;