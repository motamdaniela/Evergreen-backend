const db = require("../models");
const School = db.schools;

exports.findAll = async (req, res) => {
  try {
    console.log("aii");
    let schools = await School.find({}).exec();
    res.status(200).json({ success: true, schools: schools });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while retrieving all schools.",
    });
  }
};

// exports.findOne = async (req, res) => {
//   try {
//     if (req.loggedUser.type == "user") {
//       return res.status(403).json({
//         success: false,
//         msg: "This request requires ADMIN/SECURITY role!",
//       });
//     } else {
//       let occurrence = await Occurrence.findById(req.params.occID);
//       if (occurrence === null) {
//         return res.status(404).json({
//           success: false,
//           msg: `Cannot find any occurrence with ID ${req.params.occID}`,
//         });
//       } else {
//         res.status(200).json({ success: true, occurrence: occurrence });
//       }
//     }
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       msg:
//         err.message || "Some error occurred while retrieving this occurrence.",
//     });
//   }
// };
