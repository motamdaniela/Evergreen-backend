const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/db.config.js");
const db = require("../models");
const { verifyToken } = require("./auth.controller.js");
const Suggestion = db.suggestions;

exports.create = async (req, res) => {
  try {
    if (req.loggedUser.type !== "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires USER role!",
      });
    } else {
      await Suggestion.create({
        theme: req.body.theme,
        description: req.body.description,
        objectives: req.body.objectives,
        goals: req.body.goals,
        resources: req.body.resources,
        userID: req.loggedUser.id,
      });
      return res.status(201).json({
        success: true,
        msg: "Suggestion was registered successfully!",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg:
        err.message || "Some error occurred while retrieving all occurrences.",
    });
  }
};
