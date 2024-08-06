const express = require('express');
const router = express.Router();
const { getChats } = require('../services/chatService');

router.get('/chats', async (req, res) => {
  try {
    const chats = await getChats();
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
