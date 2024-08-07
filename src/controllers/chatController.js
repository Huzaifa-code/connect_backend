const { getChats, deleteCache } = require('../services/chatService');


// Function to fetch chats
const fetchChats = async (req, res) => {
  try {
    const chats = await getChats();
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Function to delete cache
const delCache = async (req, res) => {
    try {
        await deleteCache();
        res.send('Cache deleted successfully');
    } catch (error) {
        console.error('Error deleting cache:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
  fetchChats,
  delCache,
};
