const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');
const formatMsg = require("./utils/messages")
const app = express();
const server = http.createServer(app);
const io = socket(server, {cors: {
        origin: "*"
    }});

const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./utils/users");
// set static folder
app.use(express.static(path.join(__dirname, 'public')));



const port = 3012 || process.env.PORT;
// app.listen(port, ()=> console.log(`Listening on port ${port}`));
server.listen(port, () => {
    console.log("server running...")
})


io.on('connection', (sock) => {

    const chatCordBot = "ChatBot";

    sock.on("joinRoom", ({username, room}) => {
        const user = userJoin(sock.id, username, room)

        sock.join(user.room)
        sock.emit("message", formatMsg(chatCordBot,"welcome to chatCord"));
        sock.broadcast.to(room).emit('message', formatMsg(chatCordBot,`${username} has joined`));

        // send users and room info...
        io.to(user.room).emit("roomUsers",{
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })



    // listen for chat message...
    sock.on("chatMessage", (msg) => {
        const user = getCurrentUser(sock.id)
        io.to(user.room).emit("message", formatMsg(user.username, msg));
    })

    sock.on("disconnect", () => {
        const user = userLeave(sock.id)

        if (user){
            io.to(user.room).emit("message", formatMsg(chatCordBot,`${user.username} Disconnected!`));

            io.to(user.room).emit("roomUsers",{
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})