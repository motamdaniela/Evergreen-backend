const express = require("express");
const router = express.Router();

const occurrencesController = require("../controllers/occurrences.controller");
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
  .get(authController.verifyToken, occurrencesController.findAll)
  .post(authController.verifyToken, occurrencesController.create);

router
  .route("/:occID")
  .get(authController.verifyToken, occurrencesController.findOne)
  .put(authController.verifyToken, occurrencesController.validate);

module.exports = router;