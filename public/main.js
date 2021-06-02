$(function() {


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

const socket = io();
const inboxPeople = document.querySelector(".inbox__people");

let userName = "";

const newUserConnected = (user) => {
  userName = user || `User${Math.floor(Math.random() * 1000000)}`;
  socket.emit("new user", userName);
  addToUsersBox(userName);
};

const addToUsersBox = (userName) => {
  if (!!document.querySelector(`.${userName}-userlist`)) {
    return;
  }

  const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
  inboxPeople.innerHTML += userBox;
};

// new user is created so we generate nickname and emit event
newUserConnected();


socket.on(INCOMMING_EVENTS.NEW_USER, function (data) {
    data.map((user) => addToUsersBox(user));
  });
  
  socket.on(BC_EVENTS.USER_DISCONNECTED, function (userName) {
    document.querySelector(`.${userName}-userlist`).remove();
  });




  const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  socket.emit(OUTGOING_EVENTS.CHAT_MESSAGE, {
    message: inputField.value,
    nick: userName,
  });

  inputField.value = "";

  socket.emit(OUTGOING_EVENTS.TYPING, {
    isTyping: inputField.value.length > 0,
    nick: userName,
  });

});

socket.on(INCOMMING_EVENTS.CHAT_MESSAGE, function (data) {
  addNewMessage({ user: data.nick, message: data.message });
});


inputField.addEventListener("keyup", () => {
    socket.emit(OUTGOING_EVENTS.TYPING, {
      isTyping: inputField.value.length > 0,
      nick: userName,
    });

  });

  socket.on(INCOMMING_EVENTS.TYPING, function (data) {
    const { isTyping, nick } = data;
  
    if (!isTyping) {
      fallback.innerHTML = "";
      return;
    }
  
    fallback.innerHTML = `<p>${nick} is typing...</p>`;
  });

});
