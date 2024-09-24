const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: null }, // URL to the user's profile image
  phoneNumber: { type: String, default: null }, // User's phone number
  bio: { type: String, default: null }, // Short bio of the user
  location: { type: String, default: null }, // User's location
  dateOfBirth: { type: Date, default: null }, // User's date of birth
  resume: { type: String, default: null }, // URL to the user's resume file
  socialMediaLinks: [
    {
      platform: { type: String, required: true }, // Name of the social media platform
      link: { type: String, required: true }, // Link to the user's profile
    },
  ],
  roomsCreated: [{ type: Schema.Types.ObjectId, ref: 'Room' }], 
  roomsJoined: [{ type: Schema.Types.ObjectId, ref: 'Room' }], 
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('User', UserSchema);
