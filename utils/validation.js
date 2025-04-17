const ApiError = require("../utils/ApiError")

const validateSchemaUpdate = (req) => {

    const { userName, email, password, bio, location } = req.body

    if (!userName || !email || !password || !bio || !location) {
        throw new ApiError(400, "All fields are required")
    }

    else if (!userName || userName.length < 5 || userName.length > 20) {
        throw new ApiError(400, "UserName must be betweenn 5 and 20 characters")
    }

    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format")
    }

    else if (!password || password.length < 8 || password.length > 10) {
        throw new ApiError(400, "Password must be between 8 and 10 characters")
    }

}

module.exports = {
    validateSchemaUpdate
}