require("dotenv").config(); // read environment variables from .env file
const express = require("express");
const cors = require("cors"); // middleware to enable CORS (Cross-Origin Resource Sharing)
const app = express();
const port = process.env.PORT; // use environment variables
const host = process.env.HOST;
app.use(cors()); //enable ALL CORS requests (client requests from other domain)
app.use(express.json()); //enable parsing JSON body data

app.get("/", function (req, res) {
  res.status(200).json({ message: "home" });
});

app.use("/activities", require("./routes/activities.routes.js"));
app.use("/missions", require("./routes/missions.routes.js"));
app.use("/users", require("./routes/users.routes.js"));
app.use("/occurrences", require("./routes/occurrences.routes.js"));

app.all("*", function (req, res) {
  res.status(404).json({ message: "WHAT???" });
});
const server = app.listen(port, host, () =>
  console.log(`App listening at http://${host}:${port}/`)
);

module.exports = { app, server };
// ? para dizer o que ta feito
// ! para dizer que ta mal / incompleto
// * explicar coisas
