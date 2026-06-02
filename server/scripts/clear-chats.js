import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const clearChats = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("Deleting all chats...");
    const chatResult = await Chat.deleteMany({});
    console.log(`Deleted ${chatResult.deletedCount} chats.`);

    console.log("Deleting all messages...");
    const msgResult = await Message.deleteMany({});
    console.log(`Deleted ${msgResult.deletedCount} messages.`);

    console.log("Successfully cleared all chat data for a fresh start!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to clear database:", err);
    process.exit(1);
  }
};

clearChats();
