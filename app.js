const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// In-memory storage for rooms (replace with a database for persistence)
let rooms = [];

// Route to fetch all rooms
app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

// Route to verify a room exists
app.get('/api/verify-room/:roomId', (req, res) => {
  const { roomId } = req.params;

  // Find the room by roomId
  const room = rooms.find((room) => room.roomId === roomId);

  // If room exists, return success with creatorPeerId
  if (room) {
    return res.status(200).json({
      message: 'Room exists',
      exists: true,
      peerId: room.creatorPeerId,  // Changed 'creatorPeerId' to 'peerId' to match the front-end expectation
    });
  }

  // If room does not exist, return an error
  return res.status(404).json({
    message: 'Room not found',
    exists: false,
  });
});


// Route to add a new room
app.post('/api/add-room', (req, res) => {
  const { roomId, name } = req.body;

  // Check if roomId already exists
  const roomExists = rooms.some((room) => room.roomId === roomId);
  if (roomExists) {
    return res.status(400).json({ message: 'Room already exists' });
  }

  // Add the new room
  const newRoom = { roomId, name, createdAt: new Date() };
  rooms.push(newRoom);
  res.status(201).json({ message: 'Room added successfully', room: newRoom });
});

// Route to remove a room
app.delete('/api/remove-room/:roomId', (req, res) => {
  const { roomId } = req.params;

  // Remove the room from the list
  rooms = rooms.filter((room) => room.roomId !== roomId);
  res.json({ message: 'Room removed successfully' });
});

// New route to save creator's peer ID
app.post('/api/save-creator-peer', (req, res) => {
  const { roomId, peerId } = req.body;

  if (!roomId || !peerId) {
    return res.status(400).json({ message: 'Room ID and Peer ID are required' });
  }

  const room = rooms.find((room) => room.roomId === roomId);

  if (room) {
    room.creatorPeerId = peerId;
    res.status(200).json({ message: 'Creator peer ID saved successfully', roomId, peerId });
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

// New route to get creator's peer ID for a room
app.get('/api/get-creator-peer/:roomId', (req, res) => {
  const { roomId } = req.params;

  const room = rooms.find((room) => room.roomId === roomId);

  if (room && room.creatorPeerId) {
    res.status(200).json({ creatorPeerId: room.creatorPeerId });
  } else if (room) {
    res.status(404).json({ message: 'Creator peer ID not found for this room' });
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});