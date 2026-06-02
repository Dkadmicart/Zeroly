# Environment Variables

## Server (.env in server/)
| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| PORT | No | Express server port (defaults to 5001) | 5001 |
| MONGO_URI | Yes | MongoDB connection string | mongodb+srv://user:pass@cluster/db |
| JWT_SECRET | Yes | JWT signing secret | super_secret_string |
| CLOUDINARY_CLOUD_NAME | Yes (for uploads) | Cloudinary cloud name | demo_cloud |
| CLOUDINARY_API_KEY | Yes (for uploads) | Cloudinary API key | 1234567890 |
| CLOUDINARY_API_SECRET | Yes (for uploads) | Cloudinary API secret | cloudinary_secret |
| GOOGLE_CLIENT_ID | Yes (for Google login) | Google OAuth client ID | 123.apps.googleusercontent.com |
| RAZORPAY_KEY_ID | Optional | Razorpay key ID (if missing, mock order is returned) | rzp_test_xxx |
| RAZORPAY_KEY_SECRET | Optional | Razorpay secret (if missing, mock verification is accepted) | razorpay_secret |

## Client (.env in client/)
| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| VITE_API_URL | Yes | REST API base URL used by axios | http://localhost:5001/api |
| VITE_SOCKET_URL | Yes | Socket server URL used by socket.io-client | http://localhost:5001 |
| VITE_GOOGLE_CLIENT_ID | Yes (for Google login UI) | Google OAuth client ID for frontend | 123.apps.googleusercontent.com |
