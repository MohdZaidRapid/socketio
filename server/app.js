import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const port = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const secretKeyJWT = "sdkjskljdklsjkld";
app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "abc" }, secretKeyJWT);
  res
    .cookie("token", token, { httpOnly: true, secure: true })
    .json({ message: "Login Success" });
});

const user = false;

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;

    if (!token) return next(new Error("Authetication Error"));

    const decoded = jwt.verify(token, secretKeyJWT);

    if (!decoded) return next(new Error("Authentication Error"));

    next();
  });
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("message", ({ room, message }) => {
    console.log({ room, message });
    // socket.broadcast.emit("receive-message", data);
    socket.to(room).emit("receive-message", message);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
