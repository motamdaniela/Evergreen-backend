const db = require("../models");
const Activity = db.activities;
const Theme = db.themes;
const User = db.users;

// ? gets all activities
exports.findAll = async (req, res) => {
  try {
    if (req.loggedUser.type) {
      let data = await Activity.find({});

      return res.status(200).json({
        success: true,
        activities: data,
      });
    } else {
      return res.status(403).json({
        success: false,
        msg: "This request requires USER role!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

exports.findSub = async (req, res) => {
  let data = [];
  let activities = await Activity.find({});
  try {
    if (req.loggedUser.type == "user") {
      activities.forEach((activity) => {
        if (
          activity.users.find(
            (user) =>
              user.user == req.loggedUser.id && user.status == "subscribed"
          )
        ) {
          console.log(req.loggedUser);
          data.push(activity);
          console.log(activity);
        }
      });

      return res.status(200).json({
        success: true,
        activities: data,
      });
    } else {
      return res.status(403).json({
        success: false,
        msg: "This request requires USER role!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

// ? gets all activities that you are the coordinator of
exports.findAllCoordinator = async (req, res) => {
  try {
    if (req.loggedUser.type == "user" || req.loggedUser.type == "admin") {
      let data = [];
      let user = await User.findById({ _id: req.loggedUser.id });
      console.log(user);
      let activities = await Activity.find({});
      activities.forEach((activity) => {
        if (activity.coordinator == user.email) {
          data.push(activity);
        }
      });

      if (activities.length > 0) {
        return res.status(200).json({
          success: true,
          num: data.length,
          activities: data,
        });
      } else {
        return res.status(403).json({
          success: false,
          msg: "You are not the coordinator of any activity!",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        msg: "This request requires USER or ADMIN role!",
      });
    }
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
    return res.status(200).json({
      success: true,
      activity: activity,
    });
  } catch (err) {
    console.log(err);
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
    if (req.loggedUser.type !== "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires USER role!",
      });
    } else {
      const activity = await Activity.findById(req.params.activityID);
      console.log(activity);
      if (!activity) {
        return res.status(404).json({
          success: false,
          msg: `Cannot find any activity with ID ${req.params.activityID}`,
        });
      }
      if (activity.users.find((user) => user.user == req.loggedUser.id)) {
        let index = activity.users.indexOf(
          activity.users.find((user) => user.user == req.loggedUser.id)
        );
        activity.users.splice(index, 1);
      } else {
        activity.users.push({ user: req.loggedUser.id, status: "subscribed" });
      }
      Activity.updateOne({ _id: activity._id }, activity).exec();
      // console.log('done')
      return res.json({ success: true, activity: activity });
    }
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        msg: "id parameter is not a valid object id",
      });
    }
    return res.status(500).json({
      success: false,
      msg: `some error has occurred`,
    });
  }
};

// ? verify participation of users in activity
exports.verify = async (req, res) => {
  try {
    if (req.loggedUser.type !== "admin" && req.loggedUser.type !== "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN or USER role!",
      });
    } else {
      const activity = await Activity.findById(req.params.activityID);
      if (!activity) {
        return res.status(404).json({
          success: false,
          msg: "Activity not found",
        });
      }
      if (
        activity.users.find(
          (user) =>
            user.user == req.params.userID && user.status == "subscribed"
        )
      ) {
        activity.users.forEach((user) => {
          if (user.user == req.params.userID && user.status == "subscribed") {
            user.status = "participated";
          }
        });
      }
      Activity.updateOne({ _id: activity._id }, activity).exec();
      return res.json({ success: true, activity: activity });
    }
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        msg: "id parameter is not a valid object id",
      });
    }
    return res.status(500).json({
      success: false,
      msg: `some error has occurred`,
    });
  }
};

// ? delete deleted user from activities
exports.delete = async (req, res) => {
  try {
    if (req.loggedUser.type == "user" || req.loggedUser.type == "security") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      let activities = await Activity.find({});
      activities.forEach((activity) => {
        activity.users.forEach((user) => {
          if (user.user == req.params.userID) {
            let index = activity.users.indexOf(user);
            activity.users.splice(index, 1);
            Activity.updateOne({ _id: activity._id }, activity).exec();
          }
        });
      });

      return res.status(204).json({
        success: true,
        message: `user deleted from activities deleted successfully`,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred.",
    });
  }
};
