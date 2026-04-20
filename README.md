# Full-Stack To-Do Application

This is a beginner-friendly full-stack application built with Node.js, Express, and MongoDB.

## Requirements
* [Node.js](https://nodejs.org/en/) installed on your computer.
* [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally on standard port (`27017`).

## How to Run Locally

1. Open a terminal and navigate to this specific folder (`todo-fullstack`).
2. Make sure you install the necessary packages (`express`, `mongoose`):
   ```bash
   npm install
   ```
3. Start the application backend server:
   ```bash
   npm start
   ```
4. Open your web browser and go to your locally hosted frontend:
   [http://localhost:3000](http://localhost:3000)

## Code Architecture (Good for Interviews)
1. **Frontend**: Located in `/public`. Uses vanilla JavaScript with `fetch()` to call the API endpoints. No frameworks used.
2. **Backend**: Located in `server.js`. Uses Express to serve the frontend folder as static files and implements standard REST API routes for CRUD operations (`GET`, `POST`, `PUT`, `DELETE`).
3. **Database**: Managed by Mongoose in `models/Task.js`. Connects to a local MongoDB instance.
