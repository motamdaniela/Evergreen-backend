const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/db.config.js");
const db = require("../models");
const User = db.users;

exports.getAllUsers = async (req, res) => {};

exports.getUser = async (req, res) => {};

exports.create = async (req, res) => {
  try {
    if (!req.body && !req.body.username && !req.body.password)
      return res
        .status(400)
        .json({ success: false, msg: "Username and password are mandatory" });
    // Save user to DB
    await User.create({
      username: req.body.username,
      email: req.body.email,
      // hash its password (8 = #rounds – more rounds, more time)
      password: req.body.password,
      // password: bcrypt.hashSync(req.body.password, 10),
      type: req.body.type,
    });
    return res
      .status(201)
      .json({ success: true, msg: "User was registered successfully!" });
  } catch (err) {
    // if (err)
    //   res
    //     .status(400)
    //     .json({ success: false, msg: err.errors.map((e) => e.message) });
    // els;
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while signing up.",
    });
  }
};

exports.login = async (req, res) => {};

exports.findAll = async (req, res) => {
  try {
    let data = await User.find({});

    return res.status(200).json({
      success: true,
      users: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const user = await User.findById(req.params.userID);

    if (user === null) {
      return res.status(404).json({
        success: false,
        message: `Cannot find mission with id ${req.params.userID}`,
      });
    }
    return res.json({ success: true, user: user });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

exports.findAdmins = async (req, res) => {
  try {
    let data = await User.find({ type: "admin" });

    return res.status(200).json({
      success: true,
      users: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

exports.findUsers = async (req, res) => {
  try {
    let data = await User.find({ type: "user" });

    return res.status(200).json({
      success: true,
      users: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};
