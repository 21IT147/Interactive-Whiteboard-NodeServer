const express = require('express');
const router = express.Router();
const roomController = require('../controller/roomController.controller');
const upload = require('../middelware/multerConfig.middelware');

// Route for creating a room
router.post('/create', roomController.createRoom);

// Route for joining a room
router.post('/join', roomController.joinRoom);

router.post('/upload', upload, roomController.uploadFile);


router.post('/get-joined-rooms', roomController.getJoinedRooms);

router.post('/get-created-rooms', roomController.getCreatedRooms);

router.patch('/update-room',roomController.updateRoom);

router.delete('/delete-room',roomController.deleteRoom);

module.exports = router;
