const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const express = require("express");
const { isProfane } = require("no-profanity");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

app.use(express.json());

// Define paths for express configuration
const publicdirectoryPath = path.join(__dirname, "../public");

// Setup static directory to serve
app.use(express.static(publicdirectoryPath));

app.get("/", (req, res) => {
  res.render("index.html");
});
io.on("connection", (socket) => {
  console.log("New Socket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Welcome to Chat APP", "Admin"));
    // socket.broadcast.emit("message", generateMessage("A new user has joined!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username}  has joined!`, "admin")
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (newMessage, callback) => {
    // const filter = new Filter();
    if (isProfane(newMessage)) {
      return callback("Profanity is not allowed!");
    }
    const user = getUser(socket.id);

    if (!user) {
      location.href = "/";
      return callback();
    }

    io.to(user.room).emit(
      "message",
      generateMessage(newMessage, user.username)
    );
    // io.emit("message", generateMessage(newMessage));
    callback(); // Signal that message was received and processed successfully
  });

  socket.on("sendLocation", (newLocation, callback) => {
    const user = getUser(socket.id);
    if (!user) {
      location.href = "/";
      return callback();
    }
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        `https://www.google.com/maps/?q=${newLocation.coords.latitude},${newLocation.coords.longitude}`,
        user.username
      )
    );
    callback(); // Signal that message was received and processed successfully
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username}  has left!`, "Admin")
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("Starting server on port " + port);
});
