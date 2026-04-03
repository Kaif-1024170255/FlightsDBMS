# Green Flight Management & Sustainability Analytics System

This is a full-stack flight management database system aimed at tracking flight metrics, managing resources, and calculating sustainability metrics.

## 🛠️ Technology Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL

## 📋 Prerequisites
Before you begin, ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/en/) (v14 or higher recommended)
- [MySQL Server](https://dev.mysql.com/downloads/) (Make sure it is running)

---

## 🚀 Step-by-Step Installation & Run Guide

### 1. Database Setup
First, you need to set up the MySQL database schemas and initial data. 

1. Open your MySQL client (e.g., MySQL Workbench or via terminal).
2. Execute the scripts found in the `database` folder in the following order:
   - Run `database/init_schema.sql` (Creates the schema and tables).
   - Run `database/stored_procedures.sql` (Loads custom database procedures).
   - Run `database/seed_data.sql` (Populates the tables with dummy data for testing).
3. Open `backend/.env` and ensure the database credentials match your local MySQL setup:
```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=flights_db
PORT=5000
```

### 2. Backend Server Setup
The backend API connects to the database and serves data to the frontend.

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary Node dependencies:
   ```bash
   npm install
   ```
3. Start the backend Node server:
   ```bash
   npm start
   ```
   *The backend should now be listening on `http://localhost:5000`.*

### 3. Frontend Server Setup
The frontend is built with React and Vite. It needs to run concurrently with the backend.

1. Open a **second terminal window** (leave the backend one running) and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the frontend Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend should now be running on `http://localhost:5173`.*

## 🎉 You're Done!
Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)** to use the application.
