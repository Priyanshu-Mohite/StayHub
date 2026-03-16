# StayHub 🏕️ | Full-Stack Vacation Rental Platform

![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge\&logo=node.js\&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge\&logo=mongodb\&logoColor=white)

**StayHub** is an **Airbnb-inspired full-stack vacation rental platform** that allows users to explore, list, review, and book properties globally.

The project is built using the **Node.js, Express.js, MongoDB stack with EJS templating** and follows a clean **MVC (Model–View–Controller) architecture** for scalable application development.

🔗 **[View Live Demo](https://stayhub-yult.onrender.com/)**

---

# ✨ Key Features

### 🔐 Authentication System

Secure user authentication using **Passport.js (Local Strategy)** with **PBKDF2 password encryption**. User sessions are securely stored using **Connect-Mongo**.

### 🏠 Property Listings

Users can perform complete **CRUD operations** on vacation property listings including:

* Create new listings
* Browse listings
* Edit existing listings
* Delete listings

### 📸 Image Upload & Cloud Storage

Images are uploaded using **Multer** and stored on **Cloudinary CDN**, enabling efficient media handling and faster content delivery.

### 🗺️ Maps & Geocoding

Locations entered by users are converted into **GeoJSON coordinates using Node-Geocoder** and displayed on dynamic maps.

### 💳 Secure Payment Integration

The platform integrates **Stripe API** to securely handle checkout and payment intent generation.

### 🛡️ Data Validation & Security

Server-side validation using **Joi middleware** ensures that malformed or invalid requests never reach the database.

### ⭐ Reviews & Ratings

Authenticated users can leave **reviews and 1–5 star ratings** for property listings.

---

# 🛠️ Tech Stack

## Frontend

* HTML5
* CSS3
* Bootstrap 5
* Tailwind CSS
* EJS (Embedded JavaScript Templates)

## Backend

* Node.js
* Express.js

## Database

* MongoDB Atlas
* Mongoose ODM

## APIs & Services

* Cloudinary (Image Storage)
* Stripe API (Payments)
* Mapbox / Node-Geocoder (Location Services)

## Security & Utilities

* Passport.js
* Joi Validation
* Multer
* Express-Session
* Connect-Mongo
* Flash Messages

---

# 🚀 Architectural Highlights

## MVC Architecture

The project follows the **Model–View–Controller architecture**, separating:

* **Models** → Database schemas
* **Views** → User interface templates
* **Controllers** → Business logic

The application manages **65+ RESTful endpoints** powering listings, authentication, reviews, and payments.

## Centralized Error Handling

A custom **wrapAsync utility** is used to handle asynchronous route errors and prevent server crashes caused by unhandled promise rejections.

## Relational Data Modeling

MongoDB schemas use **referenced relationships** between:

* Users
* Listings
* Reviews

This allows efficient querying and data population across collections.

---

# 💻 Local Setup & Installation

Follow the steps below to run the project locally.

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Priyanshu-Mohite/StayHub.git
cd StayHub
```

## 2️⃣ Install Dependencies

```bash
npm install
```

## 3️⃣ Setup Environment Variables

Create a `.env` file in the root directory.

```env
# Database
ATLASDB_URL=your_mongodb_atlas_connection_string
SECRET=your_express_session_secret

# Cloudinary (Image Storage)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Maps / Geocoding
MAP_TOKEN=your_map_api_token

# Stripe (Payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 4️⃣ Initialize Database (Optional)

Seed the database with sample listings.

```bash
node init/index.js
```

## 5️⃣ Start the Server

```bash
nodemon app.js
```

The server will run at:

```
http://localhost:8080
```

---

# 📂 Project Structure

```
📦 StayHub
 ┣ 📂 controllers     # Route business logic
 ┣ 📂 models          # Mongoose database schemas
 ┣ 📂 public          # Static assets (CSS, JS, Images)
 ┣ 📂 routes          # Express route definitions
 ┣ 📂 utils           # Error handling & utility helpers
 ┣ 📂 views           # EJS templates
 ┣ 📜 app.js          # Application entry point
 ┣ 📜 middleware.js   # Custom middleware (auth, validation)
 ┗ 📜 .env            # Environment variables
```

---

# ⭐ Support

If you found this project useful, consider **starring the repository ⭐ on GitHub.**
