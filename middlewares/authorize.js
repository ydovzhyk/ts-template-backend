const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const { Session } = require("../models/session");

const { SECRET_KEY } = process.env;

const authorize = async (req, res, next) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const accessToken = authorizationHeader.replace("Bearer ", "");
    let payload = {};
    try {
      payload = jwt.verify(accessToken, SECRET_KEY);
    } catch (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const user = await User.findById(payload.id);
    const session = await Session.findOne({ uid: user._id });
    if (!user) {
      return res.status(404).send({ message: "Invalid user" });
    }
    if (!session) {
      return res
        .status(404)
        .send({ message: "Session timed out, please login again" });
    }
    req.user = user;
    req.session = session;
    next();
  } else return res.status(400).send({ message: "No token provided" });
};

module.exports = authorize;
