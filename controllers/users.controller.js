const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/db.config.js");
const db = require("../models");
const User = db.users;

//! for cloudinary
const cloudinary = require("cloudinary").v2;
// cloudinary configuration
cloudinary.config({
cloud_name: config.C_CLOUD_NAME,
api_key: config.C_API_KEY,
api_secret: config.C_API_SECRET
});


exports.postImg = async (req, res) => {
  try {
  let user_image = null;
  if (req.file) {
  // upload image
  user_image = await cloudinary.uploader.upload(req.file.path);
  }
  // save user to DB
  let img = await User.postImg({
  profile_image: user_image ? user_image.url : null, // save URL to access the image
  cloudinary_id: user_image ? user_image.public_id : null // save image ID to delete it
  });
  return res.status(201).json({ success: true, msg: "image posted successfully!", img: img });
  }
  catch (err) { 
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while posting image.",
    });
   };
  };
//!  


// ? sign up
exports.createUser = async (req, res) => {
  try {
    let arr = [
      req.body.email,
      req.body.username,
      req.body.name,
      req.body.password,
      req.body.school,
    ];
    let keys = Object.keys(req.body);
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i] || !arr[i].replace(/\s/g, "").length) {
        return res
          .status(400)
          .json({ success: false, msg: `Please provide ${keys[i]}!` });
      }
    }
    if (/\s/g.test(req.body.username)) {
      return res.status(400).json({
        success: false,
        msg: `Your username can't contain spaces!`,
      });
    }

    if (/\s/g.test(req.body.password)) {
      return res.status(400).json({
        success: false,
        msg: `Your password can't contain spaces!`,
      });
    }
    if (!(req.body.password == req.body.confPassword)) {
      return res.status(403).json({
        success: false,
        msg: `The passwords that you provided don't match!`,
      });
    }

    if ((await User.find({ email: req.body.email })).length > 0) {
      return res
        .status(409)
        .json({ success: false, msg: `Email already in use!` });
    } else if ((await User.find({ username: req.body.username })).length > 0) {
      return res
        .status(409)
        .json({ success: false, msg: `Username already in use!` });
    }

    let today = new Date();
    // Save user to DB
    await User.create({
      type: req.body.type,
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
  console.log(res.status);
};

// ? create admin
exports.createAdmin = async (req, res) => {
  try {
    if (req.loggedUser.type !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      if (req.body.type !== "admin" && req.body.type !== "security") {
        return res.status(400).json({
          success: false,
          msg: "the only users you can create are type admin and security",
        });
      }
      let arr = [
        req.body.type,
        req.body.email,
        req.body.username,
        req.body.name,
        req.body.password,
      ];

      let keys = Object.keys(req.body);
      for (let i = 0; i < arr.length; i++) {
        if (!arr[i] || !arr[i].replace(/\s/g, "").length) {
          return res
            .status(400)
            .json({ success: false, msg: `Please provide ${keys[i]}!` });
        }
      }
      if (/\s/g.test(req.body.username)) {
        return res.status(400).json({
          success: false,
          msg: `Your username can't contain spaces!`,
        });
      }

      if (/\s/g.test(req.body.password)) {
        return res.status(400).json({
          success: false,
          msg: `Your password can't contain spaces!`,
        });
      }
      if (!(req.body.password == req.body.confPassword)) {
        return res.status(403).json({
          success: false,
          msg: `The passwords that you provided don't match!`,
        });
      }

      if ((await User.find({ email: req.body.email })).length > 0) {
        return res
          .status(409)
          .json({ success: false, msg: `Email already in use!` });
      } else if (
        (await User.find({ username: req.body.username })).length > 0
      ) {
        return res
          .status(409)
          .json({ success: false, msg: `Username already in use!` });
      }
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

function streak(user) {
  let today = new Date();
  user.previousLoginDate = +user.loginDate;
  user.loginDate = +(
    today.getFullYear() +
    "" +
    ((today.getMonth() + 1).toString().length != 2
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1) +
    "" +
    (today.getDate().toString().length != 2
      ? "0" + today.getDate()
      : today.getDate())
  );
  let yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  let yesterdayDate = +(
    yesterday.getFullYear() +
    "" +
    ((yesterday.getMonth() + 1).toString().length < 2
      ? "0" + (yesterday.getMonth() + 1)
      : yesterday.getMonth() + 1) +
    "" +
    (yesterday.getDate().toString().length < 2
      ? "0" + yesterday.getDate()
      : yesterday.getDate())
  );
  if (+user.previousLoginDate == +yesterdayDate) {
    if (user.streak == 7) {
      user.streak = 1;
      user.received = false;
    } else {
      user.streak += 1;
      user.received = false;
    }
  } else if (+user.previousLoginDate < +user.loginDate) {
    user.streak = 1;
    user.received = false;
  }
  User.updateOne({ _id: user._id }, user).exec();
}

// ? login
// ! tenho de mudar aqui o previous login date???
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
    streak(user);
    return res.status(200).json({
      success: true,
      accessToken: token,
      user: user,
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

// ? find all users
exports.findAll = async (req, res) => {
  try {
    // * if logged user type=user, only finds user type=user
    if (req.loggedUser.type == "user") {
      let users = await User.find({
        type: "user",
      }).exec();
      res.status(200).json({ success: true, users: users });

      // * if logged user type=admin, finds all users
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

// ? delete user
exports.deleteUser = async (req, res) => {
  try {
    if (req.loggedUser.type !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      let user = await User.findByIdAndDelete(req.params.userID);
      console.log(user);
      console.log(!user);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User does not exist",
        });
      } else {
        console.log("ok");
        return res.status(204).json({
          success: true,
          message: `User with id ${req.params.userID} was deleted successfully`,
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

// ? block user
exports.blockUser = async (req, res) => {
  try {
    if (req.loggedUser.type !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      let user = await User.findById(req.params.userID);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User does not exist",
        });
      } else {
        user.state = req.body.state;
        await user.save();
        return res.status(200).json({
          success: true,
          message: "User state was changed successfully",
          user: user,
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

// ? edit user password
exports.editUser = async (req, res) => {
  try {
    if (req.loggedUser.type !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "This request requires Admin role!",
      });
    } else {
      let user = await User.findById(req.params.userID);
      if (req.body.password && req.body.password.replace(/\s/g, "").length) {
        if (/\s/g.test(req.body.password)) {
          return res.status(400).json({
            success: false,
            msg: `Your password can't contain spaces!`,
          });
        }
        if (req.body.password == req.body.confPassword) {
          user.password = bcrypt.hashSync(req.body.password, 10);
          return res.status(200).json({
            success: true,
            msg: `success`,
          });
        } else {
          return res.status(403).json({
            success: false,
            msg: `The passwords that you provided don't match!`,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          msg: `Please provide a valid password!`,
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

// ? edit user profile
exports.editProfile = async (req, res) => {
  try {
    if (req.loggedUser.type !== "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires USER role!",
      });
    }
    let user = await User.findById(req.params.userID);
    if (user._id == req.loggedUser.id) {
      if (req.body.username && req.body.username.replace(/\s/g, "").length) {
        if ((await User.find({ username: req.body.username })).length > 0) {
          return res
            .status(409)
            .json({ success: false, msg: `Username already in use!` });
        } else {
          user.username = req.body.username;
        }
      }
      if (req.body.photo && req.body.photo.replace(/\s/g, "").length) {
        user.photo = req.body.photo;
      }
      if (req.body.username && req.body.username.replace(/\s/g, "").length) {
        if (/\s/g.test(req.body.username)) {
          return res.status(400).json({
            success: false,
            msg: `Your username can't contain spaces!`,
          });
        } else {
          user.username = req.body.username;
        }
      }
      if (req.body.password && req.body.password.replace(/\s/g, "").length) {
        if (/\s/g.test(req.body.password)) {
          return res.status(400).json({
            success: false,
            msg: `Your password can't contain spaces!`,
          });
        }
        if (req.body.password == req.body.confPassword) {
          user.password = bcrypt.hashSync(req.body.password, 10);
        } else {
          return res.status(403).json({
            success: false,
            msg: `The passwords that you provided don't match!`,
          });
        }
      }
      await user.save();
      return res.status(200).json({
        success: true,
        message: "User was edited successfully",
        user: user,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "You can't edit this user",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

// ? subscribe council
exports.subscribeCouncil = async (req, res) => {
  try {
    if (req.loggedUser.type !== "user") {
      console.log("user");
      return res.status(403).json({
        success: false,
        msg: "This request requires USER role!",
      });
    } else {
      let user = await User.findById(req.loggedUser.id);
      if (user.council) {
        user.council = false;
      } else {
        user.council = true;
      }
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Subscribed successfully!",
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

// ? receive daily reward
exports.receiveReward = async (req, res) => {
  try {
    if (req.loggedUser.type !== "user") {
      console.log("user");
      return res.status(403).json({
        success: false,
        msg: "This request requires USER role!",
      });
    }
    let points = [
      {
        points: 1,
        badge: "idk1",
      },
      {
        points: 3,
        badge: "idk2",
      },
      {
        points: 5,
        badge: "idk3",
      },
      {
        points: 8,
        badge: "idk4",
      },
      {
        points: 10,
        badge: "idk5",
      },
      {
        points: 15,
        badge: "idk6",
      },
      {
        points: 20,
        badge: "idk7",
      },
    ];
    let user = await User.findById(req.loggedUser.id);
    if (user.received == false) {
      points.forEach((point) => {
        if (points.indexOf(point) == user.streak - 1) {
          user.point += point.points;
          user.rewards.push(point.badge);
        }
      });
      user.received = true;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "success!",
        user: user,
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "You already received today's reward!",
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

//? get one
exports.findLogged = async (req, res) => {
  try {
    let user = await User.findById(req.loggedUser.id).exec();
    if (user) {
      res.status(200).json({ success: true, user: user });

    } else if (user == null) {
      return res.status(401).json({
        success: false, msg: "You must be authenticated",
      });
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
