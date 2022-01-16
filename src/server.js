import express from "express";
import http from "http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import { v4 as uuidV4 } from "uuid";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("views", join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.static(join(__dirname, "/public")));

app.use("/peerjs", peerServer);

app.get("/", (_, res) => {
  return res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  return res.render("room", { roomId: req.params.room });
});

app.get("*", (_, res) => {
  return res.send("<h1>Not available</h1>");
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("CreateMessage", message);
    });
  });
});

server.listen(8000, () => {
  console.log("Server running on port 8000");
});
