import { db } from "./index.js";
import { users } from "./schema.js";
import { eq } from "drizzle-orm";

class Users {
    constructor() {
        // Database operations - no longer in-memory
    }

    /**
     * Create a new user in the database
     * @param {Object} newUserData - User data { name, email, age? }
     * @returns {Promise<Object>} - Created user object
     */
    async createNewUser(newUserData) {
        try {
            // Insert user into database and return the created record
            const createdUser = await db
                .insert(users)
                .values({
                    name: newUserData.name,
                    email: newUserData.email,
                    age: newUserData?.age || null,
                })
                .returning();

            // Return the first (and only) created user
            return createdUser[0];
        } catch (error) {
            console.error("Error creating user:", error.message);
            throw error;
        }
    }

    /**
     * Get a user by email from the database
     * @param {string} userEmail - User's email
     * @returns {Promise<Object|null>} - User object or null if not found
     */
    async getUserByEmail(userEmail) {
        try {
            const result = await db
                .select()
                .from(users)
                .where(eq(users.email, userEmail));

            // Return first user if found, null otherwise
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error("Error fetching user by email:", error.message);
            throw error;
        }
    }

    /**
     * Get a user by ID from the database
     * @param {number} userId - User's ID
     * @returns {Promise<Object|null>} - User object or null if not found
     */
    async getUserById(userId) {
        try {
            const result = await db
                .select()
                .from(users)
                .where(eq(users.id, userId));

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error("Error fetching user by ID:", error.message);
            throw error;
        }
    }

    /**
     * Get all users from the database
     * @returns {Promise<Array>} - Array of all users
     */
    async getAllUsers() {
        try {
            return await db.select().from(users);
        } catch (error) {
            console.error("Error fetching all users:", error.message);
            throw error;
        }
    }

    /**
     * Update user information
     * @param {number} userId - User ID to update
     * @param {Object} updateData - Data to update { name?, email?, age? }
     * @returns {Promise<Object>} - Updated user object
     */
    async updateUser(userId, updateData) {
        try {
            const updated = await db
                .update(users)
                .set(updateData)
                .where(eq(users.id, userId))
                .returning();

            return updated[0];
        } catch (error) {
            console.error("Error updating user:", error.message);
            throw error;
        }
    }

    /**
     * Delete a user from the database
     * @param {number} userId - User ID to delete
     * @returns {Promise<void>}
     */
    async deleteUser(userId) {
        try {
            await db.delete(users).where(eq(users.id, userId));
        } catch (error) {
            console.error("Error deleting user:", error.message);
            throw error;
        }
    }

    /**
     * Save refresh token (placeholder for future implementation)
     * @param {number} userId - User ID
     * @param {string} refreshToken - Refresh token to save
     * @returns {Promise<void>}
     */
    async saveTheRefreshToken(userId, refreshToken) {
        // TODO: Add refreshToken column to users table
        // Then update user with: await this.updateUser(userId, { refreshToken })
        console.log("saveTheRefreshToken - to be implemented");
    }
}

export default Users;