const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");

exports.verifyToken = (req, res, next) => {
  const header = req.headers["x-access-token"] || req.headers.authorization;

  if (typeof header == "undefined")
    return res.status(401).json({ success: false, msg: "No token provided!" });

  const bearer = header.split(" "); // Authorization: Bearer <token>
  const token = bearer[1];

  try {
    let decoded = jwt.verify(token, config.SECRET);
    req.loggedUser = { id: decoded.id, type: decoded.type }; // save user ID and role into request object
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      msg: "You must be authenticated to perform this request!",
    });
  }
};
