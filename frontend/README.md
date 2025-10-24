# API Gateway Frontend

A simple React frontend for user authentication with signup and login functionality.

## Features

- ✅ User Signup with validation
- ✅ User Login
- ✅ Loading indicators on form submission
- ✅ Success/Error message display
- ✅ Clean white and blue UI design
- ✅ Responsive design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api/users/` for:
- POST `/signup` - User registration
- POST `/login` - User authentication

Make sure the backend server is running before testing the frontend.