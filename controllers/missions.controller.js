const db = require("../models");
const Mission = db.missions;
const User = db.users;

exports.findAll = async (req, res) => {
  try {
    //utilozadores do tipo admin não devem ter acesso às missoes
    if (req.loggedUser.type !== "user") {
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
      return res.status(404).json({
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
