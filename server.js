const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = 4500 || process.env.PORT;

//Maintaining all users list
const users = [{}];

// CORS
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello its working");
});

const server = http.createServer(app);

//Socket IO section
const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("New Connection");

  //Nested Socket
  socket.on("joined", ({ userName }) => {
    console.log(`${userName} has joined`);
    users[socket.id] = userName;

    socket.broadcast.emit("userJoined", { user: "Admin", message: `${users[socket.id]} has joined` });
    socket.emit("welcome", { user: "Admin", message: `Welcome to the chat ${users[socket.id]}` });
  });

  socket.on("message", (data) => {
    //Sending received message to everyone as well as sender itself :)
    io.emit("sentMessage", { user: users[socket.id], message: data.message,id:socket.id });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("leave", { user: "Admin", message: `${users[socket.id]} has left ` });
    console.log(`${users[socket.id]} left`);
  });
});

//End Socket IO section

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
