const Room = require('../models/Room.model');
const User = require('../models/User.model');
const uploadToCloudinary = require('../utils/cloudinaryUpload');
const fs = require('fs'); 


exports.createRoom = async (req, res) => {
    const { roomId, name, creatorId } = req.body;
  
    try {
      // Check if the room already exists
      const roomExists = await Room.findOne({ roomId });
      if (roomExists) {
        return res.status(400).json({ message: 'Room already exists' });
      }
  
      // Find the user by creatorId and select only the name and roomsCreated fields
      const user = await User.findById(creatorId).select('name roomsCreated');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Create a new room
      const newRoom = new Room({
        roomId,
        name,
        creator: user._id,
        creatorName: user.name,
      });
  
      await newRoom.save();
  
      // Add the new room's ID to the user's roomsCreated array and save the user
      user.roomsCreated.push(newRoom._id);
      await user.save();
  
      // Respond with success
      res.status(201).json({
        message: 'Room created successfully',
        room: newRoom,
      });
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: 'Error creating room', error });
    }
  };
  

  exports.joinRoom = async (req, res) => {
    const { roomId, userId, userName } = req.body; // Include userName in the request body
  
    try {
      const room = await Room.findOne({ roomId });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
  
      // Check if the user is already in the room
      const userExists = room.joinedUsers.some(user => user._id.equals(userId));
      if (userExists) {
        return res.status(400).json({ message: 'User already joined the room' });
      }
  
      // Push the user object containing both id and name to the joinedUsers array
      room.joinedUsers.push({ _id: userId, userName: userName });
      await room.save();
  
      // Update the user's roomsJoined field
      const user = await User.findById(userId);
      user.roomsJoined.push(room._id);
      await user.save();
  
      res.status(200).json({
        message: 'User successfully joined the room',
        room,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error joining room', error });
    }
  };
  
  
// exports.uploadFile = async (req, res) => {
//     const { roomId, userId } = req.body;
  
//     try {
//       const room = await Room.findOne({ roomId });
//       if (!room) {
//         return res.status(404).json({ message: 'Room not found' });
//       }
  
//       if (!room.creator.equals(userId)) {
//         return res.status(403).json({ message: 'Only the creator can upload files' });
//       }
  
//       if (!req.file) {
//         return res.status(400).json({ message: 'No file uploaded' });
//       }
  
//       const fileUrl = await uploadToCloudinary(req.file.path, 'uploads');
//       const fileType = req.file.mimetype.startsWith('image') ? 'image' : 'pdf';
  
//       room.files.push({ url: fileUrl, fileType });
//       await room.save();
  
//       fs.unlinkSync(req.file.path);
  
//       res.status(200).json({
//         message: 'File uploaded and saved successfully',
//         file: { url: fileUrl, fileType },
//         room,
//       });
//     } catch (error) {
//       console.error('Error uploading file:', error);
//       res.status(500).json({ message: 'Error uploading file', error: error.message });
//     }
// };

  exports.uploadFile = async (req, res) => {
    const { roomId, userId } = req.body;
  
    try {
      // Check if the room exists
      const room = await Room.findOne({ roomId });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
  
      // Check if the user is the creator of the room
      if (!room.creator.equals(userId)) {
        return res.status(403).json({ message: 'Only the creator can upload files' });
      }
  
      // Check if file is uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      // Upload file to Cloudinary
      const fileUrl = await uploadToCloudinary(req.file.path, 'uploads'); // Specify the folder name
  
      // Determine file type
      const fileType = req.file.mimetype.startsWith('image') ? 'image' : 'pdf';
  
      // Save file URL in the room
      room.files.push({ url: fileUrl, fileType });
      await room.save();
  
      // Remove file from server after upload
      fs.unlinkSync(req.file.path);
  
      // Return response
      res.status(200).json({
        message: 'File uploaded and saved successfully',
        file: { url: fileUrl, fileType },
        room,
      });
    } catch (error) {
      console.error('Error uploading file:', error); // Log the error
      res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
  };

 

  exports.getJoinedRooms = async (req, res) => {
    const { userId } = req.body; // Assuming userId is sent in the request body
  
    try {
      // Find the user by ID and populate the roomsJoined
      const user = await User.findById(userId)
        .populate({
          path: 'roomsJoined', // Populate all details of rooms joined by the user
          populate: {
            path: 'creator', // Populate the creator's details for each joined room
            select: 'name',  // Only keep the creator's name
          },
        });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Send the joined rooms details
      res.status(200).json({
        message: 'Joined rooms fetched successfully',
        roomsJoined: user.roomsJoined,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching joined rooms', error });
    }
  };

  
  exports.getCreatedRooms = async (req, res) => {
    const { userId } = req.body; // Assuming userId is sent in the request body
  
    try {
      // Find the user by ID and populate the roomsCreated
      const user = await User.findById(userId)
        .populate({
          path: 'roomsCreated', // Populate all details of rooms created by the user
          populate: {
            path: 'joinedUsers', // Populate joinedUsers to get their details
            select: '_id name',   // Only keep the joined user IDs and names
          },
        });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Send the created rooms details
      res.status(200).json({
        message: 'Created rooms fetched successfully',
        roomsCreated: user.roomsCreated,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching created rooms', error });
    }
  };
  
  exports.updateRoom = async (req, res) => {
    const { roomId, newRoomId, name, filesToDelete = [], joinedUsersToRemove = [] } = req.body;
  
    try {
      // Find the room by roomId
      const room = await Room.findOne({ roomId });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
  
      // Update room name if provided
      if (name) {
        room.name = name;
      }
  
      // Update roomId if provided and unique
      if (newRoomId) {
        const existingRoom = await Room.findOne({ roomId: newRoomId });
        if (existingRoom) {
          return res.status(400).json({ message: 'Room ID already exists. Choose a different ID.' });
        }
        room.roomId = newRoomId;
      }
  
      // Handle file deletion
      if (filesToDelete.length > 0) {
        room.files = room.files.filter(file => !filesToDelete.includes(file.url));
  
        // Delete the files from Cloudinary
        for (let fileUrl of filesToDelete) {
          await deleteFromCloudinary(fileUrl); // Assumes you have a function to delete from Cloudinary
        }
      }
  
      // Remove joined users based on their _ids
      if (joinedUsersToRemove.length > 0) {
        room.joinedUsers = room.joinedUsers.filter(user => {
          // Keep the user if their _id is not in the joinedUsersToRemove array
          return !joinedUsersToRemove.includes(user._id.toString());
        });
      }
  
      // Save the updated room
      await room.save();
  
      res.status(200).json({
        message: 'Room updated successfully',
        room,
      });
    } catch (error) {
      console.error('Error updating room:', error);
      res.status(500).json({ message: 'Error updating room', error });
    }
  };
  
  exports.deleteRoom = async (req, res) => {
    const { roomId, userId } = req.body; // Extract roomId and userId from the request body
  
    try {
      // Find the room by roomId
      const room = await Room.findOne({ roomId });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
  
      // Check if the user is the creator of the room
      if (!room.creator.equals(userId)) {
        return res.status(403).json({ message: 'Only the creator can delete the room' });
      }
  
      // Remove the room
      await Room.deleteOne({ roomId });
  
      // Remove the room reference from the creator's user document
      const user = await User.findById(userId);
      user.roomsCreated = user.roomsCreated.filter(rId => !rId.equals(room._id));
      await user.save();
  
      // Remove the room reference from all users who have joined this room
      const joinedUsers = room.joinedUsers; // Get the array of joined users
      await User.updateMany(
        { _id: { $in: joinedUsers.map(user => user._id) } }, // Find users who joined this room
        { $pull: { roomsJoined: room._id } } // Remove the room from their roomsJoined array
      );
  
      res.status(200).json({
        message: 'Room deleted successfully and references removed from joined users',
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      res.status(500).json({ message: 'Error deleting room', error });
    }
  };
  
  