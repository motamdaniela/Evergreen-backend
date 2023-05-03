const express = require("express");
const router = express.Router();

const missionsController = require("../controllers/missions.controller");

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
router.route("/").get(missionsController.findAll);

router.route("/:missionID")
  .get(missionsController.findOne)
  // .patch(missionsController.update)


// router.route("/").get(missionsController.findAll);
// router.route("/:missionID").get(missionsController.findOne);

// router.route("/:missionID/users/:userID").put(missionsController.addBadge);

// router.all("*", (req, res) => {
//   res.status(404).json({ message: "what???" });
// });

module.exports = router;
