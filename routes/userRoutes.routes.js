const express = require('express');
const { signup, login, getAllUsers, getUserDetails, editProfile } = require('../controller/userController.controller.js');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({});
const upload = multer({ storage }).fields([{ name: 'profileImage' }, { name: 'resume' }]); // Allow multiple fields

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

router.get('/',getAllUsers);


router.post('/getuserdetails', getUserDetails);

router.patch('/edit-profile', upload,editProfile)

module.exports = router;
