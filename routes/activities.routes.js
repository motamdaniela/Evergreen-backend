const express = require("express");
const router = express.Router();
const activitiesController = require("../controllers/activities.controller");
const suggestionsController = require("../controllers/activitysuggestions.controller");
const themesController = require("../controllers/themes.controller");
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
router.route("/").get(authController.verifyToken, activitiesController.findAll);

router
  .route("/coordinator")
  .get(authController.verifyToken, activitiesController.findAllCoordinator);

router
  .route("/themes")
  .get(authController.verifyToken, themesController.findAll);

router
  .route("/subscribed")
  .get(authController.verifyToken, activitiesController.findSub);

router
  .route("/:activityID")
  .get(activitiesController.findOne)
  .patch(authController.verifyToken, activitiesController.subscribe);

router
  .route("/participation/:activityID/users/:userID")
  .patch(authController.verifyToken, activitiesController.verify);

router
  .route("/:userID")
  .delete(authController.verifyToken, activitiesController.delete);

router
  .route("/suggestion")
  .post(authController.verifyToken, suggestionsController.create);

module.exports = router;
