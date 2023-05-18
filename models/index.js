const dbConfig = require("../config/db.config.js");
const mongoose = require("mongoose");
const db = {};
db.mongoose = mongoose;

(async () => {
  try {
    await db.mongoose.connect(dbConfig.URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log("cannot connect to database", error);
    process.exit;
  }
})();

db.activities = require("./activities.model.js")(mongoose);
db.suggestions = require("./activitysuggestions.model.js")(mongoose);
db.missions = require("./missions.model.js")(mongoose);
db.users = require("./users.model.js")(mongoose);
db.occurrences = require("./occurrences.model.js")(mongoose);
module.exports = db;
