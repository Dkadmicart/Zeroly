// server/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import logger from "../utils/logger.js";


dotenv.config();


// Value-free confirmation only in non-production environments.
// Never log credential values (cloud name, API key, secret status).
if (process.env.NODE_ENV !== 'production') {
    logger.debug('Cloudinary configured');
}


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;