const express = require('express');
const app = express();
const path = require('path');
const socket = require('socket.io');
const messages = [];
const users = [];
app.use(express.static(path.join(__dirname, '/client'))); // Serve static files from the React app
app.use(express.urlencoded({ extended: false })); //x-www-form-urlencoded

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

app.use((req, res) => {
  res.status(404).send('404 not found...');
});

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running on port: 8000');
});

const io = socket(server);

io.on('connection', (socket) => {
  console.log('New client! Its id - ' + socket.id);
  socket.on('message', (message) => {
    console.log("Oh, I've got something from " + socket.id);
    messages.push(message);
    socket.broadcast.emit('message', message);
  });
  socket.on('join', (user) => {
    console.log(user + ' joined the conversation');
    users.push({ name: user, id: socket.id });
    const messageContent = user + ' has joined the conversation!';
    socket.broadcast.emit('message', { author: 'Chat Bot', content: messageContent });
  });
  socket.on('disconnect', () => {
    console.log('Oh, socket ' + socket.id + ' has left');
    const index = users.findIndex((user) => user.id === socket.id);

    if (index !== -1) {
      const { name } = users.splice(index, 1)[0];
      const messageContent = name + ' has left the conversation';
      console.log(messageContent);
      socket.broadcast.emit('message', { author: 'Chat Bot', content: messageContent });
    }
  });
  console.log("I've added a listener on message and disconnect events \n");
});
