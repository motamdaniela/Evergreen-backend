const db = require("../models");
const Mission = db.missions;
const User = db.users;

exports.update = async (req, res) => {
  try {
    if (!req.loggedUser.type) {
      return res.status(403).json({
        success: false,
        msg: "You're not allowed to perform this request",
      });
    } else {
      let missionsList = req.body.missions;
      let missions = await Mission.find({});

      missions.forEach((mission) => {
        missionsList.forEach((m) => {
          if (mission._id == m.id) {
            let user = mission.users.find((user) => user.user == m.user);
            user.user = m.user;
            user.status = m.status;
            Mission.updateOne({ _id: mission._id }, mission).exec();
          }
        });
      });
      return res.status(200).json({
        success: true,
        missions: missions,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    //utilizadores do tipo admin não devem ter acesso às missoes
    if (!req.loggedUser.type) {
      return res.status(403).json({
        success: false,
        msg: "You’re not allowed to perform this request",
      });
    } else {
      let data = await Mission.find({});

      return res.status(200).json({
        success: true,
        missions: data,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

// Display only 1 mission
exports.findOne = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.missionID);

    if (mission === null) {
      return res.status(404).json({
        success: false,
        message: `Cannot find mission with id ${req.params.missionID}`,
      });
    }
    return res.json({ success: true, mission: mission });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        msg: "Id parameter is not a valid ObjectID",
      });
    }
  }
};

exports.receiveBadge = async (req, res) => {
  try {
    if (req.loggedUser.type !== "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires USER role!",
      });
    } else {
      let user = await User.findById(req.loggedUser.id);
      let mission = await Mission.findOne({ reward: req.body.badge });
      if (!user.rewards.find((badge) => badge == req.body.badge) && mission) {
        user.rewards.push(req.body.badge);
      }
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

// ? delete deleted user from missions
exports.delete = async (req, res) => {
  try {
    if (req.loggedUser.type == "user" || req.loggedUser.type == "security") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      let missions = await Mission.find({});
      missions.forEach((mission) => {
        mission.users.forEach((user) => {
          if (user.user == req.params.userID) {
            let index = mission.users.indexOf(user);
            mission.users.splice(index, 1);
            Mission.updateOne({ _id: mission._id }, mission).exec();
          }
        });
      });

      return res.status(204).json({
        success: true,
        message: `user deleted from missions deleted successfully`,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred.",
    });
  }
};
