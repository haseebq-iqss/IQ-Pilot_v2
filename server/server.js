const { Server } = require("socket.io");
const server = require("./app.js");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });

const DB = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
mongoose.connect(DB).then(() => {
  console.log("DB connected...✅");
});

const socketServer = server.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});

const io = new Server(socketServer, {
  pingTimeout: 60000,  // Wait for 60 seconds before timing out
  pingInterval: 25000, // Send a ping every 25 seconds
  cors: {
    // origin: ["https://localhost:5173", "https://ipvt.vercel.app", "https://6zkcx3p4-5173.inc1.devtunnels.ms"],
    origin: true
  },
  // maxHttpBufferSize: 1e7, // Set maximum HTTP buffer size (10 MB in this example)
  // transports: ["websocket"], // Use WebSocket transport only
});

const liveDrivers = new Map();

io.on("connection", (socket) => {
  console.log(socket.id + " joined")

  socket.on("live-drivers", (driverData) => {
    // socket.broadcast.emit("live-drivers", "asdasd")
    // if (!liveDrivers.has(socket.id)) {
    liveDrivers.set(socket.id, driverData)
    // liveDrivers.add(driverData)

    // }
    console.log("live driver _____>", liveDrivers)
    // console.log(driverData)
    io.emit("live-drivers", Array.from(liveDrivers))
    // io.emit("live-drivers", liveDrivers)
  })

  socket.on("SOS", (sosDetails) => {
    console.log(sosDetails)
    io.emit("SOS", sosDetails)
  })

  socket.on("disconnect", () => {
    liveDrivers.delete(socket.id)
    // console.log(socket.id, "A user disconnected");
    // console.log(liveDrivers, "New Map");
    io.emit("live-drivers", Array.from(liveDrivers))
  });
}
)