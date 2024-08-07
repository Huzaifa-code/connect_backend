const redisClient = require('../config/redisClient');
const db = require('../config/firebaseAdmin');

const fetchChatsFromFirestore = async () => {
  const chatsSnapshot = await db.collection('chats').get();
  
  if (chatsSnapshot.empty) {
    return [];
  }

  return chatsSnapshot.docs.map(doc => ({
    id: doc.id,
    data: doc.data(),
  }));
};

const getChats = async () => {

  console.log('Redis Client Status:', redisClient.isOpen ? 'Connected' : 'Disconnected');

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  const cacheKey = 'chats';

  try {
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      console.log('Cache hit');
      return JSON.parse(cachedData);
    } else {
      console.log('Cache miss');
      const chats = await fetchChatsFromFirestore();
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(chats)); // Cache for 1 hour
      return chats;
    }
  } catch (error) {
    console.error('Error in getChats:', error);
    throw error;
  }
};

const deleteCache = async () => {
  const cacheKey = 'chats'; // Adjust the key based on your application

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    
    await redisClient.del(cacheKey);
    console.log('Cache deleted');
  } catch (error) {
    console.error('Error deleting cache:', error);
    throw error;
  }
};

module.exports = {
  getChats,
  deleteCache
};
