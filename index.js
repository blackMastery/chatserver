const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
const { log } = require("console");

// App setup
const INCOMMING_EVENTS = {
  NEW_USER: 'NEW_USER',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  TYPING: 'TYPING',
  PRIVATE_MESSAGE:'PRIVATE_MESSAGE'
};


const BC_EVENTS = {
  NEW_USER: 'NEW_USER',
  USER_DISCONNECTED: 'USER_DISCONNECTED',
  ALL_USERS: 'ALL_USERS',
  USER_CONNECTED: 'USER_CONNECTED'

};
const OUTGOING_EVENTS = {
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  TYPING: 'TYPING',
  PRIVATE_MESSAGE:'PRIVATE_MESSAGE' 
};

const SOCKET_EVENTS = {
   CONNECTION: 'connection',
   DISCONNECT: 'disconnect'
}

const PORT = process.env.PORT || 5000;
const app = express();

app.options('/',cors());
const server = require('http').createServer(app);

 server.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server, {
  cors: {
    origin: '*'
  }
});



io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

const logs = (data)=>{
  console.log(data)
}
io.protocol= 6;

const activeUsers = new Set();





// TODO: (4)ADD JWT AUTH 





io.on(SOCKET_EVENTS.CONNECTION, function (socket) {
  console.log("Made socket connection");




  // fetch existing users
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  socket.emit(BC_EVENTS.ALL_USERS, users);

  // notify existing users
  socket.broadcast.emit(BC_EVENTS.USER_CONNECTED, {
    userID: socket.id,
    username: socket.username,
  });

  // forward the private message to the right recipient
  socket.on("private message", ({ content, to }) => {
    socket.to(to).emit("private message", {
      content,
      from: socket.id,
    });
  });




  socket.on(INCOMMING_EVENTS.NEW_USER, function (data) {
    log(data)
    socket.userId = data;
    activeUsers.add(data);
    io.emit(BC_EVENTS.NEW_USER, [...activeUsers]);
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    activeUsers.delete(socket.userId);
    io.emit(BC_EVENTS.USER_DISCONNECTED, socket.userId);
  });


  socket.on(INCOMMING_EVENTS.CHAT_MESSAGE, function (data) {
    log(data)
    io.emit(OUTGOING_EVENTS.CHAT_MESSAGE, data);
});


socket.on(INCOMMING_EVENTS.TYPING, function (data) {
    log(data)
    socket.broadcast.emit(OUTGOING_EVENTS.TYPING, data);
  });
  
});