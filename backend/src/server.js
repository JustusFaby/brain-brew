require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes =
require("./routes/authRoutes");

const roomRoutes =
require("./routes/roomRoutes");

const sessionRoutes =
require("./routes/sessionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/session", sessionRoutes);

app.get("/", (req, res) => {
  res.send("Virtual Study Cafe API Running");
});

const server =
http.createServer(app);

const io =
new Server(server,{
 cors:{
   origin:"*"
 }
});

require("./sockets/chatSocket")(io);

server.listen(
  process.env.PORT,
  () => {
    console.log("Server Running");
  }
);
