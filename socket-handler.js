class SocketHandler {
    constructor(io) {
        this.io = io;
        this.users = new Map(); // Store username by socket ID
    }

    initialize() {
        this.io.on('connection', (socket) => {
            console.log('A user connected');
            
            // Join the broadcast room
            socket.join('broadcast');
            
            // Handle user joining with username
            socket.on('join', (username) => {
                this.users.set(socket.id, username);
                // Send welcome message only to the new user
                socket.emit('message', `Welcome to the chat, ${username}!`);
                // Announce to others that someone joined
                socket.to('broadcast').emit('message', `${username} joined the chat`);
            });
            
            // Handle incoming messages
            socket.on('message', (data) => {
                // Broadcast the message to everyone in the room (including sender)
                this.io.to('broadcast').emit('message', {
                    username: data.username,
                    message: data.message
                });
            });

            socket.on('disconnect', () => {
                const username = this.users.get(socket.id);
                if (username) {
                    // Notify others when someone leaves
                    socket.to('broadcast').emit('message', `${username} left the chat`);
                    this.users.delete(socket.id);
                }
                console.log('User disconnected');
            });
        });
    }
}

module.exports = SocketHandler; 