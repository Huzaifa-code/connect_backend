const express = require('express');
const router = express.Router();
const { fetchChats, delCache } = require('../controllers/chatController');

// Route to fetch chats
router.get('/chats', fetchChats);

// Route to delete cache
router.delete('/delcache', delCache);


module.exports = router;
