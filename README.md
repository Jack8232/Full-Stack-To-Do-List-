# Full-Stack-To-Do-List

A simple to-do list application with user authentication built using the MERN stack (MongoDB, Express, React, Node.js).

## Prerequisites

Have the following installed before running the application:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup and Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Full-Stack-To-Do-List-.git
cd Full-Stack-To-Do-List-
```

### 2. Start MongoDB

Make sure MongoDB is running on your local machine:

```bash
# Start MongoDB (if not running as a service)
mongod
```

### 3. Set Up and Run the Backend

```bash
# Navigate to the api directory
cd api

# Install dependencies
npm install

# Start the backend server
npm run dev
```

The backend server will start on http://localhost:4000.

### 4. Set Up and Run the Frontend

Open a new terminal window:

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install axios @mui/material @emotion/react @emotion/styled web-vitals


# Start the frontend server
npm start
```

The React application will start on http://localhost:3000 and should automatically open in your default browser.


## License

This project is licensed under the MIT License.