import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { v4 as uuidV4 } from 'uuid';

// Create __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000

const app = express()
const server = http.createServer(app);
const io = new SocketIOServer(server);


app.use(express.static(path.join(__dirname, 'public')));


app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/bot', (req, res) => {
    res.redirect(`/OmphileAIAssistant.html`);
});
let peerConnections = {};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html file
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to redirect to the bot page
app.get('/bot', (req, res) => {
    res.redirect('/OmphileAIAssistant.html');
});

// Endpoint to register a peer ID
app.get('/call', (req, res) => {
    const peerId = req.query.peer_id;
    if (peerId) {
        peerConnections[peerId] = true;
        res.send({ status: 'success', peerId });
    } else {
        res.status(400).send({ status: 'error', message: 'Peer ID is required' });
    }
});

// Endpoint to fetch all available peer IDs
app.get('/peers', (req, res) => {
    res.send({ status: 'success', peers: Object.keys(peerConnections) });
});

// Remove peer connection when the peer disconnects
app.get('/disconnect', (req, res) => {
    const peerId = req.query.peer_id;
    if (peerConnections[peerId]) {
        delete peerConnections[peerId];
        res.send({ status: 'success', message: 'Peer disconnected' });
    } else {
        res.status(400).send({ status: 'error', message: 'Peer ID not found' });
    }
});
app.get('/call', (reg, res) => { })
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


server.listen(port, () => {
    console.log(`listening port ${port}`)
});