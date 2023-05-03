const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");

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
router.route("/").get(usersController.findAll);
router.route("/:userID").get(usersController.findOne)
router.route("/admins").get(usersController.findAdmins);
router.route("/allusers").get(usersController.findUsers);

module.exports = router;
