const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creatorName: { type: String, required: true },
  joinedUsers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userName: { type: String }
    }
  ],
  files: [{ url: String, fileType: String }],  // Array to store file URLs and their types
});

module.exports = mongoose.model('Room', roomSchema);
