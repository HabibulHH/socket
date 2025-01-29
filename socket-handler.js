class SocketHandler {
    constructor(io) {
        this.io = io;
    }

    initialize() {
        this.io.on('connection', (socket) => {
            console.log('A user connected');
            
            // Join the broadcast room
            socket.join('broadcast');
            
            // Send welcome message only to the new user
            socket.emit('message', 'Welcome to the chat!');
            
            // Announce to others that someone joined
            socket.to('broadcast').emit('message', 'A new user joined the chat');
            
            // Handle incoming messages
            socket.on('message', (msg) => {
                // Broadcast the message to everyone in the room (including sender)
                this.io.to('broadcast').emit('message', `User said: ${msg}`);
            });

            socket.on('disconnect', () => {
                // Notify others when someone leaves
                socket.to('broadcast').emit('message', 'A user left the chat');
                console.log('User disconnected');
            });
        });
    }
}

module.exports = SocketHandler; 