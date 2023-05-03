const db = require("../models");
const Activity = db.activities;
const User = db.users;

// ? gets all activities
exports.findAll = async (req, res) => {
  let idT = req.query.idTheme;
  // console.log(idTheme);
  let condition = {};
  if (idT != undefined) {
    condition = { idTheme: idT };
  }
  // let condition = idTheme ? { idTheme: new RegExp(idTheme, "i") } : {};
  try {
    let data = await Activity.find(condition);

    return res.status(200).json({
      success: true,
      activities: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

// ? get one activity by id
exports.findOne = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityID);
    if (activity === null)
      return res.status(404).json({
        success: false,
        msg: `Cannot find any activity with ID ${req.params.activityID}`,
      });
    return res.json({ success: true, activity: activity });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        msg: "id parameter is not a valid object id",
      });
    }
    return res.status(500).json({
      success: false,
      msg: `error retrieving activity with ID ${req.params.activityID}`,
    });
  }
};

// ? subscribe / unsubscribe to activity
exports.subscribe = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityID);
    if (activity === null)
      return res.status(404).json({
        success: false,
        msg: `Cannot find any activity with ID ${req.params.activityID}`,
      });

    if (activity.users.find((id) => id == req.params.userID)) {
      activity.users.splice(activity.users.indexOf(req.params.userID), 1);
    } else {
      activity.users.push(req.params.userID);
    }
    await activity.save();
    return res.json({ success: true, activity: activity });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        msg: "id parameter is not a valid object id",
      });
    }
    return res.status(500).json({
      success: false,
      msg: `error retrieving activity with ID ${req.params.activityID}`,
    });
  }
};
