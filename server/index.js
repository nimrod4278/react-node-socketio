const { text } = require('express');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const routerIndex = require('./routers/index');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./uttils/users');

const port = process.env.SERVER_PORT || 5000

const app = express();
app.use('/', routerIndex);

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('connected');

    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);

        socket.emit('msg', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('msg', { user: 'admin', text: `${user.name} have joined!` })

        socket.join(user.room);

        callback();
    });

    socket.on('sendMsg', (msg, callback) => {
        const { name, room } = getUser(socket.id);

        io.to(room).emit('msg', { user: name, text: msg })

        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('msg', { user: 'Admin', text: `${user.name} has left.` });
            // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        }
    })
});

server.listen(port, () => {
    console.log('Server listening on port ' + port);
})