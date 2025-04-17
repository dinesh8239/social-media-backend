const User = require("../models/user.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const bcrypt = require("bcrypt")
const uploadOnCloudinary = require("../config/cloudinary.js")
const { validateSchemaUpdate } = require("../utils/validation.js")

const jwt = require("jsonwebtoken");
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        // console.log('Access Token Secret:', process.env.ACCESS_TOKEN_SECRET);
        // console.log('Refresh Token Secret:', process.env.REFRESH_TOKEN_SECRET);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token: " + error.message);
    }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: Refresh token is missing.");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token: User not found.");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token: Token expired or used.");
        }

        const options = {
            httpOnly: true,
            server: true
        };

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully."));
    } catch (error) {
        throw new ApiError(401, error?.message || "Something went wrong while refreshing access token.");
    }
});

const register = asyncHandler(async (req, res) => {
    try {

        validateSchemaUpdate(req);
        const { email, password, userName, bio, location } = req.body;

        // console.log(req.body);

        if (!email || !password || !userName || !bio || !location) {
            throw new ApiError(400, "All fields are required.");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, "User already exists.");
        }

        const avatarBuffer = req.files?.avatar?.[0]?.buffer;

        if (!avatarBuffer) {
            throw new ApiError(400, "Avatar file is required.");
        }

        const fileSizeInMB = avatarBuffer.length / (1024 * 1024);
        if (fileSizeInMB > 5) { // Changed the limit to 5MB
            throw new ApiError(400, "File size exceeds the maximum allowed size of 5MB.");
        }

        const uploadedAvatar = await uploadOnCloudinary(avatarBuffer);

        if (!uploadedAvatar) {
            throw new ApiError(400, "Failed to upload avatar to Cloudinary.");
        }

        const user = await User.create({
            userName,
            email,
            password,
            bio,
            location,
            avatar: uploadedAvatar.secure_url,
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken").lean();

        if (!createdUser) {
            throw new ApiError(500, "User not created.");
        }

        return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully."));
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong during registration.");
    }
});

const login = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body
        //  console.log(req.body);

        if (!email || !password) {
            throw new ApiError(400, "email and password are required")
        }

        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        const loggedInUser = await User.findById(user._id)
            .select("-password -refreshToken")
            .lean()

        const options = {
            httpOnly: true,
            server: true
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
            )
    }
    catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong")
    }
})

module.exports = {
    refreshAccessToken,
    generateAccessAndRefreshTokens,
    register,
    login
};

