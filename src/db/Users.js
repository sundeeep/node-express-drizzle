import {v4 as uuidv4} from "uuid";

class Users {
    constructor(){
        this.users = []
    }

    createNewUser(newUserData) {
        const newUserId = uuidv4() // unique identifier just now generated
        newUserData.id = newUserId;
        this.users.push(newUserData);
        return this.users.find((user) => user.id === newUserId);
    }

    getUserByEmail(userEmail) {
        return this.users.find((user) => user.email === userEmail);
    }

    saveTheRefreshToken(userId, refreshToken) {
        // homework
    }
}

export default Users;