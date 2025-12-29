const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      userType: user.userType,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30d" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      userType: user.userType,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "45d" }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
