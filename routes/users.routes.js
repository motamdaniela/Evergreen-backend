const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");
const authController = require("../controllers/auth.controller");

router.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    // finish event is emitted once the response is sent to the client
    const diffSeconds = (Date.now() - start) / 1000; // figure out how many seconds elapsed
    console.log(
      `${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`
    );
  });
  next();
});

//! for cloudinary
const multer = require('multer')
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
  cb(null, '/tmp') // set up a directory named “tmp” where all files will be saved
  },
  filename: function (req, file, cb) {
  cb(null, Date.now() + '-' + file.originalname ) // give the files a new identifier
  }
  })
  
// acccepts a single file upload: specifies the field name where multer looks for the file
const multerUploads = multer({ storage }).single('image');

router.route('/image')
.post(multerUploads, usersController.postImg);
//!


router.route("/").get(authController.verifyToken, usersController.findAll);

router
  .route("/dailyReward")
  .patch(authController.verifyToken, usersController.receiveReward);

router
  .route("/council")
  .patch(authController.verifyToken, usersController.subscribeCouncil);
router
  .route("/:userID")
  .delete(authController.verifyToken, usersController.deleteUser)
  .patch(authController.verifyToken, usersController.blockUser);

router
  .route("/adminEdit/:userID")
  .patch(authController.verifyToken, usersController.editUser);

router
  .route("/edit/:userID")
  .patch(authController.verifyToken, usersController.editProfile);

router.route("/login").post(usersController.login);

router.route("/signup").post(usersController.createUser);

router
  .route("/createAdmin")
  .post(authController.verifyToken, usersController.createAdmin);


router.route("/getLogged").get(authController.verifyToken, usersController.findLogged);
module.exports = router;
