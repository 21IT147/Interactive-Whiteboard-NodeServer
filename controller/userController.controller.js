const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const uploadToCloudinary = require('../utils/cloudinaryUpload');
const fs = require('fs');

// Signup controller
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during signup', error });
  }
};

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'User logged in successfully',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password from the response
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

exports.editProfile = async (req, res) => {
  const { userId } = req.body; // Get userId from the request body
  const { profileImage, resume } = req.files; // Access uploaded files
  const { phoneNumber, bio, location, dateOfBirth, socialMediaLinks } = req.body; // Get other profile fields

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Upload profile image if provided
    if (profileImage && profileImage.length > 0) {
      const profileImageUrl = await uploadToCloudinary(profileImage[0].path, 'profile_images');
      user.profileImage = profileImageUrl; // Update user's profile image URL
    }

    // Upload resume if provided
    if (resume && resume.length > 0) {
      const resumeUrl = await uploadToCloudinary(resume[0].path, 'resumes');
      user.resume = resumeUrl; // Update user's resume URL
    }

    // Update other user fields if provided
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth;
    user.socialMediaLinks = socialMediaLinks ? JSON.parse(socialMediaLinks) : user.socialMediaLinks; // Parse the JSON string if sent

    // Save updated user details
    await user.save();

    // Remove uploaded files from the server
    if (profileImage && profileImage.length > 0) {
      fs.unlinkSync(profileImage[0].path);
    }
    if (resume && resume.length > 0) {
      fs.unlinkSync(resume[0].path);
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  const { userId } = req.body; // Assuming userId is sent in the request body

  try {
    // Find the user by ID
    const user = await User.findById(userId)
      .populate({
        path: 'roomsCreated', // Populate all details of rooms created by the user
        select: '-creator -creatorName', // Exclude creatorId and creatorName from roomsCreated
        populate: {
          path: 'joinedUsers', // Include full array of joinedUsers _id for roomsCreated
          select: '_id', // Only select _id for the joinedUsers
        },
      })
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

    // Prepare the user details object
    const userDetails = {
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
      location: user.location,
      dateOfBirth: user.dateOfBirth,
      resume: user.resume,
      socialMediaLinks: user.socialMediaLinks,
    };

    // Modify the roomsCreated data (keeping the joinedUsers _id array)
    const roomsCreated = user.roomsCreated.map(room => ({
      ...room._doc,
      joinedUsers: room.joinedUsers, // Keep joinedUsers _ids intact
    }));

    // Modify the roomsJoined data (keep the joinedUsers _ids and creator name)
    const roomsJoined = user.roomsJoined.map(room => ({
      ...room._doc,
      joinedUsers: room.joinedUsers, // Keep joinedUsers _ids intact
      creatorName: room.creator.name, // Add the creator's name
      creator: undefined // Remove the full creator object
    }));

    // Send the user details along with modified room data
    res.status(200).json({
      message: 'User details fetched successfully',
      user: {
        ...userDetails, // Append user details
        roomsCreated, // Modified rooms created by the user (with joinedUsers _ids)
        roomsJoined,  // Modified rooms joined by the user (with joinedUsers _ids)
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error });
  }
};

