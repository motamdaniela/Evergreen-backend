const db = require("../models");
const Theme = db.themes;

exports.findAll = async (req, res) => {
  try {
    if (req.loggedUser) {
      let themes = await Theme.find({}).exec();
      res.status(200).json({ success: true, themes: themes });
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
        err.message || "Some error occurred while retrieving all themes.",
    });
  }
};
