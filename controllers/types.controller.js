const db = require("../models");
const Occurrence = db.occurrences;

exports.findAll = async (req, res) => {
  try {
    if (req.loggedUser) {
      let types = await Occurrence.schema.path("type").enumValues;

      res.status(200).json({ success: true, types: types });
    } else {
      return res.status(401).json({
        success: false,
        msg: "You have to be logged in",
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
