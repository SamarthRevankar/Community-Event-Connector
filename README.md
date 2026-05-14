# Community Event Connector: How It Works

This document provides a technical overview of the **Community Event Connector** architecture and the mechanics behind its core features.

---

## 🏗️ Architecture Overview

The application is built using a modern **MERN-like** stack (though utilizing Vite and modern React patterns), following a decoupled Frontend/Backend architecture:

- **Frontend**: A high-performance Single Page Application (SPA) built with **React 19** and **Vite**.
- **Backend**: A robust RESTful API powered by **Node.js** and **Express 5**.
- **Database**: **MongoDB** (via Mongoose) for flexible, document-oriented storage of events and registrations.
- **Real-time**: **Socket.io** for bi-directional communication between the server and connected clients.

---

## 🔄 Core Mechanics & Data Flow

### 1. Event Management & Discovery
At its core, the system revolves around **Events**. Each event contains metadata including title, description, category, date, and geographic coordinates (latitude/longitude).

- **API Layer**: The backend provides a set of REST endpoints (`/api/events`) to perform CRUD operations.
- **Search & Filtering**: Filtering is handled server-side through MongoDB queries, allowing users to narrow down events by category, date range, or text search.
- **Frontend State**: React components fetch data via **Axios** and manage the display state, ensuring a responsive user experience.

### 2. 📍 Geographic Discovery (Map Integration)
One of the standout features is the interactive map visualization.

- **Leaflet.js**: We use **React-Leaflet** to render an interactive map.
- **Spatial Data**: Events fetched from the API include coordinates. These are mapped to markers on the Leaflet instance.
- **Clustering**: To handle high densities of events, **react-leaflet-cluster** is implemented to group markers dynamically as the user zooms out.
- **Interactivity**: Clicking a marker on the map navigates the user to the specific event detail page, bridging the gap between geographic discovery and detailed information.

### 3. ⚡ Real-time Engine
The application isn't just static data; it's alive.

- **Socket.io Integration**: When a client connects, a persistent WebSocket connection is established.
- **Live Updates**: The system is designed to broadcast events (like new registrations or event updates) to all connected clients instantly, reducing the need for manual refreshes.
- **Connection Lifecycle**: The backend tracks active connections, providing a foundation for future features like live attendee counts or chat.

### 4. 📝 Registration & RSVP System
The registration flow manages user intent to attend events.

- **Relational Logic**: While MongoDB is NoSQL, we maintain a logical relationship between `Events` and `Registrations`.
- **Validation**: The backend uses **express-validator** to ensure registration data (email, name, etc.) is clean and secure before persisting it to the database.
- **Feedback Loop**: Upon successful registration, the UI provides immediate visual feedback, and the backend can trigger real-time notifications.

---

## 🎨 Styling & UX
- **Tailwind CSS**: Utility-first styling ensures a premium, modern look with consistent spacing and typography.
- **Responsive Design**: The layout is fluid, adapting seamlessly from desktop browsers to mobile devices.
- **Lucide Icons**: A curated set of icons provides visual cues for categories and actions.

---

## 🛠️ Technical Stack Summary

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, React Router |
| **State/API** | Axios, Socket.io-client |
| **Maps** | Leaflet, React-Leaflet, Leaflet Cluster |
| **Backend** | Node.js, Express 5, Socket.io |
| **Database** | MongoDB, Mongoose |
| **DevOps** | Vercel (Deployment), Dotenv |

---

## 🚀 Deployment Logic
The project is configured for **Vercel** deployment:
- **Backend**: Uses `vercel.json` to route API requests to the serverless entry point (`server.js`).
- **Frontend**: Built and served as static assets, with environment variables configuring the connection to the Backend API.
