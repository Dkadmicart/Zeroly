# 🚀 Zeroly — Hyperlocal Community Reuse Platform

> **Triwizardthon Hackathon Project** by the **Dumbledore Devs** team.  
> *Turn unused goods into community good and lead a zero-waste lifestyle.*

---

## 🌟 About the Project

**Zeroly** is a modern, premium hyperlocal SaaS platform where community members can give away, request, or swap usable items with neighbors. Built for high performance, ease-of-use, and visual excellence, Zeroly gamifies sustainability, bringing people closer through sharing while promoting a **zero-waste footprint**.

### ✨ Core Features

*   📍 **Geospatial Map Integration & Picker**: Interactive Leaflet maps combined with autocomplete-driven location inputs that let users set precise coordinates for items they upload or seek.
*   🔐 **Advanced Dual Auth System**: Ultra-secure authentication featuring traditional JWT credentials along with seamless **Google Sign-In Authentication** via Google OAuth 2.0.
*   ☁️ **Optimized Media Pipeline**: High-performance image uploads via **Cloudinary**, reinforced with backend-validated rate limits, file size filters, and error handlers.
*   🏆 **Gamified Leaderboard & Eco-Progress**: Live leaderboard highlighting top community donors, styled with premium progress bars (`shadcn/ui`) and zero-waste rewards.
*   💬 **Real-time Peer-to-Peer Communication**: Chat system built using **Socket.io** enabling direct messaging between interested item takers and donors.
*   🙋 **Modern Glassmorphic Help & FAQs**: Fully responsive FAQ explorer featuring sleek, custom accordion animations and micro-interactions.
*   🎨 **Premium UI/UX System**: Stunning glassmorphism design tokens constructed with Tailwind CSS v4, smooth animations powered by `framer-motion`, and custom-tailored `shadcn/ui` controls.

---

## 🛠️ The Tech Stack

### Frontend Architecture
*   **Core**: [React 19](https://react.dev/) & [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
*   **UI Components**: Custom `@base-ui/react` and `lucide-react` tailored widgets
*   **Maps**: [Leaflet](https://leafletjs.com/) & `react-leaflet`
*   **OAuth**: `@react-oauth/google`
*   **Slider/Carousels**: `Swiper`
*   **Realtime/API**: `socket.io-client` & `axios`

### Backend Infrastructure
*   **Runtime**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
*   **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas/database) & [Mongoose ORM](https://mongoosejs.com/)
*   **Auth**: `jsonwebtoken` & `bcryptjs`
*   **Storage**: [Cloudinary](https://cloudinary.com/) (using `multer` and `multer-storage-cloudinary`)
*   **Security & Gatekeeping**: `express-rate-limit` for DDoS prevention and API protection
*   **Realtime**: `socket.io`

---

## 🚀 Getting Started

Follow these step-by-step setup instructions to configure and run Zeroly in your local environment.

### 📋 Prerequisites

Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.x or higher)
*   `npm` (v9.x or higher)
*   A MongoDB Atlas database instance
*   A Cloudinary media storage account
*   A Google Cloud Developer console project (for Google Auth credentials)

---

### 🖥️ Backend Configuration & Launch

1.  **Navigate into the `server` directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**  
    Create a `.env` file in the root of the `server/` directory and configure the variables as follows:
    ```env
    PORT=5001
    MONGO_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=your_jwt_signing_secret_string
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    GOOGLE_CLIENT_ID=your_google_oauth_client_id
    ```

4.  **Run in Development Mode:**
    ```bash
    npm run dev
    ```
    > The backend REST API server will run at `http://localhost:5001/api` and socket endpoints at `http://localhost:5001`.

---

### 🎨 Frontend Configuration & Launch

1.  **Navigate into the `client` directory:**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**  
    Create a `.env` file in the root of the `client/` directory and configure it:
    ```env
    VITE_API_URL=http://localhost:5001/api
    VITE_SOCKET_URL=http://localhost:5001
    VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
    ```

4.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    > The client web app will open at `http://localhost:5173`.

---

## 📁 Repository Structure

```
Zeroly/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable widgets (UI, ModeToggle, Hero, MapPicker...)
│   │   ├── lib/                # Utility modules (utils.js)
│   │   ├── pages/              # Views (HomePage, ExplorePage, LeaderboardPage, FAQPage...)
│   │   ├── App.jsx             # React routing setup
│   │   └── index.css           # Global design variables & Tailwind imports
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend API & Gateway
│   ├── controllers/            # Request handlers (itemController, userController...)
│   ├── models/                 # Database Schema definitions (Item, User, Request)
│   ├── routes/                 # Express REST Endpoints
│   ├── index.js                # Server main entrypoint & Socket initialization
│   └── package.json
└── README.md
```

---

## 🧑‍💻 The Dumbledore Devs Team

*   🛡️ **Samarth Khare** — Team Leader
*   ✨ **Sneha** — Core Developer
*   ⚡ **Shivam Gupta** — Core Developer
*   🌟 **Prateek Amar Batham** — Core Developer

---

*Made with 💚 to promote a sustainable, zero-waste future.*
