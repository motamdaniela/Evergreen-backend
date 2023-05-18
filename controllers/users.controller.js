const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/db.config.js");
const db = require("../models");
const { verifyToken } = require("./auth.controller.js");
const User = db.users;

exports.createUser = async (req, res) => {
  try {
    if (!req.body && !req.body.username && !req.body.password)
      return res
        .status(400)
        .json({ success: false, msg: "Username and password are mandatory" });
    // Save user to DB
    let today = new Date();
    await User.create({
      email: req.body.email,
      username: req.body.username,
      name: req.body.name,
      // hash its password (8 = #rounds – more rounds, more time)
      password: bcrypt.hashSync(req.body.password, 10),
      school: req.body.school,
      previousLoginDate: 0,
      loginDate: +(
        today.getFullYear() +
        "" +
        ((today.getMonth() + 1).toString().length != 2
          ? "0" + (today.getMonth() + 1)
          : today.getMonth() + 1) +
        "" +
        (today.getDate().toString().length != 2
          ? "0" + today.getDate()
          : today.getDate())
      ),
      streak: 0,
      received: false,
      points: 0,
      activitiesCompleted: 0,
      occurrencesDone: 0,
      rewards: [],
      council: false,
    });
    return res.status(201).json({
      success: true,
      msg: "User was registered successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while signing up.",
    });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    if (req.loggedUser.type !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      if (req.body.type !== "admin" && req.body.type !== "security")
        return res.status(400).json({
          success: false,
          msg: "the only users you can create are type admin and security",
        });
      // Save user to DB
      await User.create({
        type: req.body.type,
        email: req.body.email,
        username: req.body.username,
        name: req.body.name,
        password: bcrypt.hashSync(req.body.password, 10),
      });
      return res.status(201).json({
        success: true,
        msg: "User was registered successfully!",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while signing up.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    if (!req.body || !req.body.username || !req.body.password)
      return res.status(400).json({
        success: false,
        msg: "Must provide username and password.",
      });

    let user = await User.findOne({ username: req.body.username }); //get user data from DB
    if (!user)
      return res.status(404).json({
        success: false,
        msg: "User not found.",
      });

    // tests a string (password in body) against a hash (password in database)
    const check = bcrypt.compareSync(req.body.password, user.password);
    if (!check)
      return res.status(401).json({
        success: false,
        accessToken: null,
        msg: "Invalid credentials!",
      });

    // sign the given payload (user ID and type) into a JWT payload – builds JWT token, using secret key
    const token = jwt.sign({ id: user.id, type: user.type }, config.SECRET, {
      expiresIn: "24h", // 24 hours
    });
    return res.status(200).json({
      success: true,
      accessToken: token,
    });
  } catch (err) {
    if (err instanceof ValidationError)
      res.status(400).json({
        success: false,
        msg: err.errors.map((e) => e.message),
      });
    else
      res.status(500).json({
        success: false,
        msg: err.message || "Some error occurred at login.",
      });
  }
};

exports.findAll = async (req, res) => {
  try {
    console.log(req.loggedUser);
    if (req.loggedUser.type == "user") {
      let users = await User.find({
        type: "user",
      }).exec();
      res.status(200).json({ success: true, users: users });
    } else if (req.loggedUser.type == "admin") {
      let users = await User.find({});
      res.status(200).json({ success: true, users: users });
    } else {
      return res.status(403).json({
        success: false,
        msg: "You don't have access to this",
      });
    }
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
        message: `Cannot find user with id ${req.params.userID}`,
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

exports.deleteUser = async (req, res) => {
  try {
    if (req.loggedUser.type !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      const user = await User.findByIdAndDelete(req.params.userID)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User does not exist"
        })
      } else {
        return res.status(200).json({
          success: true,
          message: `User with id ${req.params.userID} was deleted successfully`
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

exports.blockUser = async (req, res) => {
  try {
    if (req.loggedUser.type !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      let user = await User.findById(req.params.userID);
      user.state = req.body.state;
      await user.save();
      return res.status(200).json({
        success: true,
        user: user,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};
