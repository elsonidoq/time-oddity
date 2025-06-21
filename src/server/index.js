const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../dist')));

// Serve the main HTML file - THIS IS NO LONGER NEEDED
/*
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});
*/

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Game state management
const gameState = {
    players: new Map(),
    gameData: {
        score: 0,
        level: 1,
        time: 0
    }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Handle player join
    socket.on('player-join', (playerData) => {
        gameState.players.set(socket.id, {
            id: socket.id,
            name: playerData.name || 'Player',
            score: 0,
            position: { x: 100, y: 450 },
            connectedAt: new Date()
        });

        // Send current game state to new player
        socket.emit('game-state', {
            players: Array.from(gameState.players.values()),
            gameData: gameState.gameData
        });

        // Notify other players
        socket.broadcast.emit('player-joined', {
            id: socket.id,
            name: playerData.name || 'Player'
        });
    });

    // Handle player movement
    socket.on('player-move', (movementData) => {
        const player = gameState.players.get(socket.id);
        if (player) {
            player.position = movementData.position;
            socket.broadcast.emit('player-moved', {
                id: socket.id,
                position: movementData.position
            });
        }
    });

    // Handle score updates
    socket.on('score-update', (scoreData) => {
        const player = gameState.players.get(socket.id);
        if (player) {
            player.score = scoreData.score;
            gameState.gameData.score = Math.max(gameState.gameData.score, scoreData.score);
            
            // Broadcast score update
            io.emit('score-updated', {
                playerId: socket.id,
                score: scoreData.score,
                gameScore: gameState.gameData.score
            });
        }
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        gameState.players.delete(socket.id);
        
        // Notify other players
        socket.broadcast.emit('player-left', {
            id: socket.id
        });
    });

    // Handle chat messages
    socket.on('chat-message', (messageData) => {
        const player = gameState.players.get(socket.id);
        if (player) {
            io.emit('chat-message', {
                playerId: socket.id,
                playerName: player.name,
                message: messageData.message,
                timestamp: new Date().toISOString()
            });
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Time Oddity server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Game: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = { app, server, io }; 