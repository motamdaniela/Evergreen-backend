const db = require("../models");
const User = db.users;

exports.findAll = async (req, res) => {

  try {
    let data = await User.find({})

    return res.status(200).json({
      success: true,
      users: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

exports.findOne = async (req, res) => {

    try {  
      const user = await User.findById(req.params.userID)
      
      if(user === null) {
        return res.status(404).json({
            success: false,
            message:`Cannot find mission with id ${req.params.userID}`
        })
      }
      return res.json({ success: true, user: user})
      
    } catch (err) {
      return res.status(500).json({
        success: false,
        msg: err.message || "Some error occurred",
      });
    }
  };


exports.findAdmins = async (req, res) => {
  
    try {
      let data = await User.find({ type: 'admin'})
  
      return res.status(200).json({
        success: true,
        users: data,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        msg: err.message || "Some error occurred",
      });
    }
  };

  exports.findUsers = async (req, res) => {
  
    try {
      let data = await User.find({ type: 'user'})
  
      return res.status(200).json({
        success: true,
        users: data,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        msg: err.message || "Some error occurred",
      });
    }
  };