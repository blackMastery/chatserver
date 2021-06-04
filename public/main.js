$(function() {


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

  
  };
  const OUTGOING_EVENTS = {
    CHAT_MESSAGE: 'CHAT_MESSAGE',
    TYPING: 'TYPING',
  PRIVATE_MESSAGE:'PRIVATE_MESSAGE' 

     
  };
  


const socket = io();
socket.onAny((event, ...args) => {
  console.log(event, args);
});


let allUser= [];
const inboxPeople = document.querySelector(".inbox__people");

let userName = "";
let selectUserId;

const newUserConnected = (user) => {
  userName = user || `User${Math.floor(Math.random() * 1000000)}`;


  socket.auth = { username:userName };
  socket.connect();
  // socket.emit(BC_EVENTS.NEW_USER, userName);
  // addToUsersBox('',userName);
};

const addToUsersBox = (id,userName) => {
  if (!!document.querySelector(`.${userName}-userlist`)) {
    return;
  }

  const userBox = `
    <div
    data-userId="${id}" 
    class="chat_ib ${userName}-userlist">
      ${userName}
    </div>
  `;
  inboxPeople.innerHTML += userBox;
};


function selectedUser(usr){
  let id = usr.getAttribute('userId');
  console.log(id);
}

inboxPeople.addEventListener("click",function(e){
   console.log('click')
  if(e.target && e.target.nodeName == "DIV") {
    selectUserId = e.target.getAttribute('data-userId');
    console.log({selectUserId});

  }
})

// new user is created so we generate nickname and emit event
newUserConnected();



socket.on("connect_error", (err) => {

  console.log(err);
  // if (err.message === "invalid username") {
  //   this.usernameAlreadySelected = false;
  // }
});

// socket.off("connect_error");


socket.on(BC_EVENTS.ALL_USERS, function (data) {
    console.log(data)
    allUser =[ ...data];
    allUser.map((user) => addToUsersBox( user.userID, user.username));

  });
  
  socket.on(BC_EVENTS.USER_DISCONNECTED, function (userName) {
    document.querySelector(`.${userName}-userlist`).remove();
  });




const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");

const direct_message_form = document.querySelector(".direct_message_form");
const direct_message__input = document.querySelector(".direct_message__input");


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



direct_message_form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!direct_message__input.value) {
    return;
  }

   console.log(selectUserId)
   if(selectUserId){
     socket.emit(OUTGOING_EVENTS.PRIVATE_MESSAGE, {
       content: direct_message__input.value,
       to: selectUserId,
      });
      
    }
  direct_message__input.value = "";

  // socket.emit(OUTGOING_EVENTS.TYPING, {
  //   isTyping: inputField.value.length > 0,
  //   nick: userName,
  // });

});


socket.on(OUTGOING_EVENTS.PRIVATE_MESSAGE, function ({ content, from }) {
  // addNewMessage({ user: data.nick, message: data.message });

  console.log({ content, from })
});



socket.on(INCOMMING_EVENTS.CHAT_MESSAGE, function (data) {
  addNewMessage({ user: data.nick, message: data.message });
});


socket.on(BC_EVENTS.USER_CONNECTED, function (user) {
  addToUsersBox(user.userID, user.username)
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
