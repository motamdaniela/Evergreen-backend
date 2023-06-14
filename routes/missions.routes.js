const express = require("express");
const router = express.Router();

const missionsController = require("../controllers/missions.controller");
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
router
  .route("/")
  .get(authController.verifyToken, missionsController.findAll)
  .patch(authController.verifyToken, missionsController.receiveBadge);

router.route("/:missionID").get(missionsController.findOne);

router
  .route("/:userID")
  .delete(authController.verifyToken, missionsController.delete);

router
  .route("/update")
  .patch(authController.verifyToken, missionsController.update);

module.exports = router;
