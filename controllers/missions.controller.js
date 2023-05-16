const db = require("../models");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const config = require("../config/db.config.js");
// const { verifyToken } = require("./auth.controller.js");
const Mission = db.missions;
// const Comment = db.comments;
// Create and Save a new Comment into a certain tutorial:
// use comment.save() to create a new comment document
// use Tutorial.findByIdAndUpdate() (with the $push operator) to include the new comment
// reference in the tutorial document

exports.findAll = async (req, res) => {
  // let title = req.query.title;

  try {
    //o utilizador deve ter sessão iniciada
    console.log(req.loggedUser);
    if (req.loggedUser){
      //utilozadores do tipo admin não devem ter acesso às missoes
      if(req.loggedUser.type === "admin"){
        return res.status(403).json({
          success: false, msg: "You’re not allowed to perform this request"
        });
      }
      let data = await Mission.find({})
  
      return res.status(200).json({
        success: true,
        missions: data,
      });
    } else {
      return res.status(401).json({
        success: false, msg: "You must be authenticated to perform this request"
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
      const mission = await Mission.findById(req.params.missionID)
      
      if(mission === null) {
        return res.status(404).json({
            success: false,
            message:`Cannot find mission with id ${req.params.missionID}`
        })
      }
      return res.json({ success: true, mission: mission})
  }
  catch(err){
    if (err.name === "CastError") {
      return res.status(404).json({
          success: false, 
          msg: "Id parameter is not a valid ObjectID"
      })
  }
  }
};

// exports.update = async (req, res) => {
//   try {
//     const mission = await Mission.findByIdAndUpdate(
//       req.params.missionID,
//       req.body,
//       {
//           runValidators: true,
//       }
//     ).exec()
    
//     if(!mission) {
//       return res.status(404).json({
//           success: false,
//           msg: `Cannot update mission with ID ${req.params.missionID}`
//       })
//     }
//     return res.status(200).json({
//         success: true,
//         msg: 'mission was updated successfully'
//     })

//   }
  
//   catch(err) {
//     if (err.name === "CastError" ) {
//       return res.status(400).json({
//           success: false,
//           msg: "Id parameter is not a valid ObjectID"
//       })
//     }
//   }
// }

// // receive badge
// exports.addBadge = (req, res) => {
//   missions.forEach((mission) => {
//     if (mission.id == req.params.missionID) {
//       users.forEach((user) => {
//         if (user.id == req.params.userID) {
//           if (!user.rewards.find((badge) => badge == mission.reward)) {
//             user.rewards.push(mission.reward);
//             res.json(user);
//           } else {
//             res.json("you already have this badge");
//           }
//         }
//       });
//     }
//   });
// };
