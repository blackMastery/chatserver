const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
const { log } = require("console");

// App setup
const INCOMMING_EVENTS = {
  NEW_USER: 'NEW_USER',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  TYPING: 'TYPING'
};


const BC_EVENTS = {
  NEW_USER: 'NEW_USER',
  USER_DISCONNECTED: 'USER_DISCONNECTED',

};
const OUTGOING_EVENTS = {
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  TYPING: 'TYPING'
   
};

const SOCKET_ENVENTS = {
   CONNECTION: 'connection',
   DISCONNECTION: 'disconnection'
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


const logs = (data)=>{
  console.log(data)
}
io.protocol= 6;

const activeUsers = new Set();





// TODO: (4)ADD JWT AUTH 





io.on(SOCKET_ENVENTS.CONNECTION, function (socket) {
  console.log("Made socket connection");

  socket.on(INCOMMING_EVENTS.NEW_USER, function (data) {
    log(data)
    socket.userId = data;
    activeUsers.add(data);
    io.emit(BC_EVENTS.NEW_USER, [...activeUsers]);
  });

  socket.on(SOCKET_ENVENTS.DISCONNECTION, () => {
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