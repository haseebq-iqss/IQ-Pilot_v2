const server = require("./app.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config({ path: "./config.env" });

const DB = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
mongoose.connect(DB).then(() => {
  console.log("DB connected...✅");
});

server.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
