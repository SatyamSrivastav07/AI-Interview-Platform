const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const sendAuthResponse = (res, statusCode, user) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(409);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
    });

    sendAuthResponse(res, 201, user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    sendAuthResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
