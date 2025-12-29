const Token = require("../models/tokenModel");

const saveUserToken = async (userId, accessToken, refreshToken) => {
  const tokenRecord = await Token.findOne({ userId });

  if (tokenRecord) {
    tokenRecord.accessToken = accessToken;
    tokenRecord.refreshToken = refreshToken;
    tokenRecord.isLogout = false; // Reset logout status on new token save
    await tokenRecord.save();
  } else {
    await Token.create({
      userId,
      accessToken,
      refreshToken,
      isLogout: false,
    });
  }
};

module.exports = saveUserToken;
