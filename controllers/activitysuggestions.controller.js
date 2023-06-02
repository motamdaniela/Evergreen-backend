const db = require("../models");
const Suggestion = db.suggestions;
const Theme = db.themes;

exports.create = async (req, res) => {
  try {
    if (req.loggedUser.type !== "user") {
      return res.status(403).json({
        success: false,
        msg: "This request requires USER role!",
      });
    } else {
      let themes = await Theme.find();
      if (themes.find((theme) => theme.name == req.body.theme)) {
        await Suggestion.create({
          theme: req.body.theme,
          description: req.body.description,
          objectives: req.body.objectives,
          goals: req.body.goals,
          resources: req.body.resources,
          userID: req.loggedUser.id,
        });
        return res.status(201).json({
          success: true,
          msg: "Suggestion was registered successfully!",
        });
      } else {
        res.status(400).json({
          success: false,
          msg:"Invalid theme",
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg:
        err.message || "Some error occurred while submiting suggestion",
    });
  }
};
