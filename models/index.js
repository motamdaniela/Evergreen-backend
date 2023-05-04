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

//? outra opção
// db.url = dbConfig.URL;
// db.mongoose
//   .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log("Connected to the database!");
//   })
//   .catch((err) => {
//     console.log("Cannot connect to the database!", err);
//     process.exit();
//   });
// ?

db.activities = require("./activities.model.js")(mongoose);
db.missions = require("./missions.model.js")(mongoose);
db.users = require("./users.model.js")(mongoose);
module.exports = db;
