const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");
const  authController = require("../controllers/auth.controller");

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
router.route("/")
  .get(authController.verifyToken, usersController.findAll); // admin access

router.route("/:userID")
  .get(authController.verifyToken, usersController.findOne) //  admin or logged user only 

router.route("/admins").get(usersController.findAdmins);
router.route("/allusers").get(usersController.findUsers);

module.exports = router;
