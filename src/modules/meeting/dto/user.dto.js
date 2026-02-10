class CreateUserDTO {
    constructor({ name, email, password, timezone }) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.timezone = timezone || 'UTC';
    }

    validate() {
        const errors = [];

        if (!this.name || this.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }

        if (!this.email || !this.isValidEmail(this.email)) {
            errors.push('Valid email is required');
        }

        if (!this.password || this.password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

class UserResponseDTO {
    constructor(user) {
        this.id = user.id || user._id; // Handle both id and _id
        this._id = user._id || user.id; // Ensure _id is also present
        this.name = user.name;
        this.email = user.email;
        this.timezone = user.timezone;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}

class LoginDTO {
    constructor({ email, password }) {
        this.email = email;
        this.password = password;
    }

    validate() {
        const errors = [];

        if (!this.email) {
            errors.push('Email is required');
        }

        if (!this.password) {
            errors.push('Password is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = {
    CreateUserDTO,
    UserResponseDTO,
    LoginDTO
};
