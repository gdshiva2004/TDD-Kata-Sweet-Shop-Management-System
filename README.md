# 🍬 SweetShop — MERN Stack Application

Inventory + Purchase + Cart System with Admin Panel

A full-stack MERN application where users can browse sweets, add items to cart, make purchases, and admins can manage inventory.
Supports authentication, authorization, admin-only operations, and smooth UI animations using Anime.js.

## 🚀 Features

### 👤 Authentication
* Register & Login (JWT-based)
* Persistent session stored in localStorage
* Flash messages after login/register

### 🛒 Cart System
* Add to cart (guest & authenticated)
* Update quantity
* Remove items
* Cart data synced between localStorage & backend
* Cart bump animation using Anime.js

### 🍭 Sweets Management (Admin Only)
* Add sweets
* Edit sweets
* Delete sweets
* Restock sweet inventory
* Image support
* Fully animated admin UI

### 🛍️ User Features
* Browse sweets
* Real-time purchase count update
* Add to cart or “Buy Now”

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Authenticate user |

### Sweets
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/sweets` | Add sweet (Admin) |
| GET | `/api/sweets` | List sweets |
| GET | `/api/sweets/search` | Search sweets |
| GET | `/api/sweets/:id` | Get sweet |
| PUT | `/api/sweets/:id` | Update sweet (Admin) |
| DELETE | `/api/sweets/:id` | Delete sweet (Admin) |

### Inventory
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/sweets/:id/purchase` | Purchase sweet |
| POST | `/api/sweets/:id/restock` | Restock sweet (Admin) |

### Cart
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/cart` | Get user cart |
| POST | `/api/cart` | Add item |
| PUT | `/api/cart/:itemId` | Update qty |
| DELETE | `/api/cart/:itemId` | Remove item |
| POST | `/api/cart/checkout` | Checkout (purchase all items) |

## 🛠️ Tech Stack

### Frontend
* React
* Anime.js
* Context API
* React Router
* Fetch API

### Backend
* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Auth
* Express Validator

## 📁 Folder Structure (Simplified)

```bash
frontend/
  src/
    components/
    context/
    hooks/
    pages/
    utils/
backend/
  src/
    controllers/
    middleware/
    models/
    routes/
    config/
```

## 📦 Installation

### 1. Clone the repository
git clone <repo-url>
cd SweetShop

### 2. Setup & Run Backend (in one terminal)
cd backend
npm install
```bash
 ---
 Create a .env file in this 'backend' folder and add the following:

 PORT=4000
 MONGO_URI=<your-mongo-uri>
 JWT_SECRET=<your-secret>
 JWT_EXPIRES_IN=7d
 ---
```

## Start the backend server
```bash
npm start
```

### 3. Setup & Run Frontend (in a new terminal)
```bash
cd ../frontend
npm install
npm run dev
```

## 🔐 Creating an Admin User

```bash
node scripts/createAdmin.js
```
## 🧠 My AI Usage
This project includes a dedicated section describing how AI tools were used, per the assignment requirement.

## 🔧 Tools Use
ChatGPT (GPT-4/GPT-4.1/GPT-5)

GitHub Copilot (occasionally)

## 🧩 How I Used AI
1. ChatGPT — Primary Development Assistant

- I used ChatGPT extensively during this project for the following:

- Debugging backend API issues

- Designing the MongoDB schema structure

- Implementing JWT authentication logic

- Generating React component structures (Navbar, SweetCard, AdminPanel, Cart page)

- Creating CSS-in-JS styling

- Writing animations using Anime.js

- Creating the Cart system architecture (CartContext, useCart hook)

- Implementing optimistic UI updates and animations

- Generating commit messages in RED/GREEN/REFACTOR format

- Designing helper scripts like createAdmin.js

- Writing README documentation

Most importantly:

- I treated ChatGPT like a senior engineer reviewing my work.

- I iterated, tested, asked for fixes, and refined until the code met requirements.

2. GitHub Copilot — Inline Suggestions

- I used Copilot for:

- Auto-completing repetitive React boilerplate

- Speeding up writing effect hooks & small utility functions

- Suggesting Mongoose model field types

- Copilot was used passively (inline suggestions), while ChatGPT was used purposefully (intentional queries).

## Reflection: How AI Impacted My Workflow
- Using AI significantly accelerated development and improved structure. Key benefits:

- Faster debugging: I resolved issues like route mismatches, context errors, and API response structure much faster.

- Cleaner architecture: AI helped design a modular Cart system and admin panel.

- Better UI/UX: Anime.js animations and component polish were AI-guided.

- Learning boost: I deepened understanding of JWT, React Context, optimistic UI, and Express routing.

However:

- I did not blindly copy AI output; I manually reviewed and modified everything.

- everal bugs required real debugging, experimenting, and verifying logic myself.

- AI was used as an assistant, not a replacement for my own reasoning.
