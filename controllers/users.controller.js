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
    await User.create({
      type: "user",
      email: req.body.email,
      username: req.body.username,
      name: req.body.name,
      // hash its password (8 = #rounds – more rounds, more time)
      password: bcrypt.hashSync(req.body.password, 10),
      school: req.body.school,
      previousLoginDate: 0,
      loginDate: 0,
      streak: 0,
      received: false,
      photo: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      points: 0,
      activitiesCompleted: 0,
      occurencesDone: 0,
      rewards: [],
      state: "active",
      council: false
    });
    return res.status(201).json({ 
      success: true, 
      msg: "User was registered successfully!" 
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
    if (req.loggedUserType !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      if (!req.body && !req.body.username && !req.body.password)
        return res
          .status(400)
          .json({ success: false, msg: "Username and password are mandatory" });
      // Save user to DB
      await User.create({
        type: "admin",
        email: req.body.email,
        username: req.body.username,
        name: req.body.name,
        password: bcrypt.hashSync(req.body.password, 10),
        photo: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        state: "active",
        data: "data"
      });
      return res.status(201).json({ 
        success: true, 
        msg: "User was registered successfully!" 
      });
    }
    
  }
  catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while signing up.",
    });
  }
}

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

// ? do we need this

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

exports.getAllUsers = async (req, res) => {
  try {
    if (req.loggedUserType !== "admin")
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    // do not expose users' sensitive data
    let users = await User.findAll({
      attributes: ["id", "username", "email", "type"],
    });
    res.status(200).json({ success: true, users: users });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while retrieving all users.",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.loggedUserType !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      let users = await User.find({});
      let index = users.indexOf(
        users.find((user) => user.id === req.params.userID)
      );

      if (index > -1) {
        users.splice(index, 1);
        return res.status(200).json({
          success: true,
          users: users,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: `Cannot find user with id ${req.params.userID}`,
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
    if (req.loggedUserType !== "admin") {
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