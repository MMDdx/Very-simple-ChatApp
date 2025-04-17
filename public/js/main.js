const chatForm  = document.querySelector("#chat-form")
const socket = io("0.0.0.0");
const chatMessages = document.querySelector(".chat-messages")

const roomName = document.querySelector("#room-name")
const userList = document.querySelector("#users")



let vars = window.location.search.replace("?","").split("&")
let f= {}
vars.map(obj => {
    let temp = obj.split("=")
    f[temp[0]] = temp[1]
})
const {username, room} = f;

// join chatroom
socket.emit("joinRoom", {username, room})

socket.on("roomUsers", ({room, users}) => {
    outPutRoomName(room)
    outPutUsers(users)

})

socket.on("message", message=> {
    outPutMsg(message);
    // scroll down to it
    chatMessages.scrollTop = chatMessages.scrollHeight;
})





chatForm.onsubmit = event => {
    event.preventDefault();
    // get msg text
    const message = event.target.elements.msg.value;
    // emiting a msg to server
    socket.emit("chatMessage", message);
    event.target.elements.msg.value = "";
    event.target.elements.msg.focus();

}

function outPutMsg(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<div class="message">
        <p class="meta">${message.username}<span>${message.time}</span></p>
        <p class="text">
          ${message.text}
        </p>
      </div>`;
    document.querySelector(".chat-messages").appendChild(div);
}

// add room name
function outPutRoomName(room){
    roomName.innerText = room;
}


function outPutUsers(users){
   userList.innerHTML = `
   ${users.map(user => `<li>${user.username}</li>`).join('')}
   `;
}