const db = require("../models");
const Activity = db.activities;
const Theme = db.themes;
const User = db.users;

// ? gets all activities
exports.findAll = async (req, res) => {
  let theme = await Theme.findById(req.query.idTheme);
  let condition = {};
  if (theme != undefined) {
    condition = { idTheme: theme._id };
  }
  try {
    if (req.loggedUser.type == "user") {
      let data = await Activity.find(condition);

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
  let data = []
  let activities = await Activity.find({})
  try {
    if (req.loggedUser.type == "user") {
      activities.forEach((activity) => {
        if(activity.users.find((user) => user.user == req.loggedUser.id && user.status == 'subscribed')){
          console.log(req.loggedUser)
          data.push(activity);
          console.log(activity)
        }
      })

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
      let activities = await Activity.find({ coordinator: req.loggedUser.id });
      if (activities.length > 0) {
        return res.status(200).json({
          success: true,
          num: activities.length,
          activities: activities,
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
      activity: activity 
    });
  } catch (err) {
    console.log(err)
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
      console.log(activity)
      if(!activity) {
        return res.status(404).json({
          success: false,
          msg: `Cannot find any activity with ID ${req.params.activityID}`,
        })
      }
      if (activity.users.find((user) => user.user == req.loggedUser.id)) {
        let index = activity.users.indexOf(activity.users.find((user) => user.user == req.loggedUser.id))
        activity.users.splice(index,1)
        console.log('1', activity.users)
      } else {
        activity.users.push({ user: req.loggedUser.id, status: "subscribed" });
        console.log('2', activity.users)
      }
      // await activity.save();
      Activity.updateOne({ _id: activity._id }, activity).exec();
      console.log('done')
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
    if (req.loggedUser.type !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      const activity = await Activity.findById(req.params.activityID);
      if (
        activity.users.find(
          (user) => user.id == req.params.userID && user.status == "subscribed"
        )
      ) {
        activity.users.forEach((user) => {
          if (user.id == req.params.userID && user.status == "subscribed") {
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
