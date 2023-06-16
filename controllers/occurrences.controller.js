const db = require("../models");
const Occurrence = db.occurrences;
const School = db.schools;

exports.findAll = async (req, res) => {
  try {
    if (req.loggedUser.type == "user") {
      let occurrences = await Occurrence.find({
        userID: req.loggedUser.id,
      }).exec();
      res.status(200).json({ success: true, occurrences: occurrences });
    } else if (
      req.loggedUser.type == "admin" ||
      req.loggedUser.type == "security"
    ) {
      let occurrences = await Occurrence.find({});
      res.status(200).json({ success: true, occurrences: occurrences });
    } else {
      return res.status(403).json({
        success: false,
        msg: "You don't have access to this",
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

exports.create = async (req, res) => {
  try {
    if (req.loggedUser.type !== "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires USER role!",
      });
    } else {
      let arr = [
        req.body.school,
        req.body.building,
        req.body.classroom,
        req.body.type,
        req.body.description,
        req.body.photo,
      ];
      let keys = Object.keys(req.body);
      for (let i = 0; i < arr.length; i++) {
        if (!arr[i] || !arr[i].replace(/\s/g, "").length) {
          return res
            .status(400)
            .json({ success: false, msg: `Please provide ${keys[i]}` });
        }
      }
      let school = await School.findOne({ name: req.body.school });

      if (school == undefined) {
        return res
          .status(400)
          .json({ success: false, message: "School does not exist" });
      }

      let building = school.buildings.find(
        (building) => building.name == req.body.building
      );

      if (building == undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Building does not exist" });
      }

      let today = new Date();
      let other = "";
      if (req.body.type == "Outro") {
        other = req.body.other;
      }

      let oc = await Occurrence.create({
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
        userID: req.loggedUser.id,
        state: "pending",
        other: other,
      });
      return res.status(201).json({
        success: true,
        msg: "Occurrence was registered successfully!",
        occurrence: oc,
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

exports.findOne = async (req, res) => {
  try {
    if (req.loggedUser.type == "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN/SECURITY role!",
      });
    } else {
      let occurrence = await Occurrence.findById(req.params.occID);
      if (occurrence === null) {
        return res.status(404).json({
          success: false,
          msg: `Cannot find any occurrence with ID ${req.params.occID}`,
        });
      } else {
        res.status(200).json({ success: true, occurrence: occurrence });
      }
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
    if (req.loggedUser.type == "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN/SECURITY role!",
      });
    } else {
      let occurrence = await Occurrence.findById(req.params.occID);
      if (occurrence === null) {
        return res.status(404).json({
          success: false,
          msg: `Cannot find any occurrence with ID ${req.params.occID}`,
        });
      } else {
        occurrence.state = req.body.state;
        await occurrence.save();
        res.status(200).json({ success: true, occurrence: occurrence });
      }
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg:
        err.message || "Some error occurred while retrieving this occurrence.",
    });
  }
};

// ? delete occurrence made by user that was deleted
exports.delete = async (req, res) => {
  try {
    if (req.loggedUser.type == "user" || req.loggedUser.type == "security") {
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!",
      });
    } else {
      await Occurrence.deleteMany({
        userID: req.params.userID,
      });

      return res.status(204).json({
        success: true,
        message: `Occurrences deleted successfully`,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred.",
    });
  }
};
