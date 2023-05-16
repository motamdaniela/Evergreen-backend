const express = require("express");
const router = express.Router();
const activitiesController = require("../controllers/activities.controller");
const authController = require("../controllers/auth.controller");

// router.route("/").get(activitiesController.findAll);
// router.route("/:activityID").get(activitiesController.findOne);

// router
//   .route("/:activityID/users/:userID")
//   .put(activitiesController.bodyValidator, activitiesController.subscribe);

// router.route("/themes/:themeID").get(activitiesController.filter);
// //   .put(activitiesController.bodyValidator, activitiesController.update);

// router.all("*", (req, res) => {
//   res.status(404).json({ message: "what???" });
// });

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
router.route("/").get(activitiesController.findAll);
router.route("/:activityID").get(activitiesController.findOne);
router.route("/:activityID/users/:userID")
  .put(activitiesController.subscribe);

router.route("/participation/:activityID/users/:userID")
  .put(authController.verifyToken, activitiesController.verifyParticipation);

module.exports = router;
