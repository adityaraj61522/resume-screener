// src/models/index.js

class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
}

class Resume {
    constructor(userId, content) {
        this.userId = userId;
        this.content = content;
    }
}

module.exports = {
    User,
    Resume
};