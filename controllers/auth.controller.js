const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
const config = require("../config/db.config.js");
// const db = require("../models");
// const base64url = require("base64-url");

exports.verifyToken = (req, res, next) => {
  // const encodedHeader = base64url.encode(header);

  // const encodedPayload = base64url.encode(payload);

  // const data = encodedHeader + "." + encodedPayload;
  // const hashedData = Hash(data, secret);
  // const signature = base64url.encode(hashedData);

  // header.payload.signature;
  // const JWT = encodedHeader + "." + encodedPayload + "." + signature;
  // search token in headers most commonly used for authorization
  const header = req.headers["x-access-token"] || req.headers.authorization;

  if (typeof header == "undefined")
    return res.status(401).json({ success: false, msg: "No token provided!" });

  const bearer = header.split(" "); // Authorization: Bearer <token>
  const token = bearer[1];

  try {
    let decoded = jwt.verify(token, config.SECRET);
    console.log(decoded);
    console.log(config.SECRET);
    req.loggedUser = { id: decoded._id, type: decoded.type }; // save user ID and role into request object
    console.log(req.loggedUser);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, msg: "Unauthorized!" });
  }
};
