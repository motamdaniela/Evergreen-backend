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

router.route("/").get(authController.verifyToken, usersController.findAll);

router
  .route("/council")
  .patch(authController.verifyToken, usersController.subscribeCouncil);
router
  .route("/:userID")
  // .get(usersController.findOne)
  .delete(authController.verifyToken, usersController.deleteUser)
  .patch(authController.verifyToken, usersController.blockUser);

router.route("/:userID/edit").patch(usersController.editProfile);

router.route("/login").post(usersController.login);

router.route("/signup").post(usersController.createUser);

router
  .route("/createAdmin")
  .post(authController.verifyToken, usersController.createAdmin);

module.exports = router;
