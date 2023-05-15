const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/db.config.js");
const db = require("../models");
const { verifyToken } = require("./auth.controller.js");
const Occurrence = db.occurrences;

exports.findAll = async (req, res) => {
  try {
    console.log(req.loggedUserType);
    if (req.loggedUserType == "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN/SECURITY role!",
      });
    } else {
      let occurrences = await Occurrence.find({});
      res.status(200).json({ success: true, occurrences: occurrences });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg:
        err.message || "Some error occurred while retrieving all occurrences.",
    });
  }
};

exports.create = async (req, res) => {
  try {
    console.log(req);
    if (req.loggedUserType !== "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires USER role!",
      });
    } else {
      let today = new Date();
      await Occurrence.create({
        date:
          today.getDate() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getFullYear(),
        hour:
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds(),
        school: req.body.school,
        building: req.body.building,
        classroom: req.body.classroom,
        type: req.body.type,
        description: req.body.description,
        photo: req.body.photo,
        userID: req.loggedUserId,
        state: "pending",
      });
      return res
        .status(201)
        .json({ success: true, msg: "User was registered successfully!" });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg:
        err.message || "Some error occurred while retrieving all occurrences.",
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    if (req.loggedUserType == "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN/SECURITY role!",
      });
    } else {
      let occurrence = await Occurrence.findById(req.params.occID);
      res.status(200).json({ success: true, occurrence: occurrence });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg:
        err.message || "Some error occurred while retrieving this occurrence.",
    });
  }
};

exports.validate = async (req, res) => {
  try {
    if (req.loggedUserType == "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN/SECURITY role!",
      });
    } else {
      let occurrence = await Occurrence.findById(req.params.occID);
      occurrence.state = req.body.state;
      await occurrence.save();
      res.status(200).json({ success: true, occurrence: occurrence });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg:
        err.message || "Some error occurred while retrieving this occurrence.",
    });
  }
};
