# Liza Frontend

Simple React frontend for the Liza marketplace backend.

## Features

- **Main Page**: 
  - List of all products
  - Form to create new products (requires login)
  - "Create Order" button for each product
  - List of user's orders (if logged in)

- **Profile Page**:
  - User profile information
  - List of user's products
  - List of user's orders

- **Authentication**:
  - Login/Signup pages
  - Protected routes

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure your backend is running on `http://localhost:8000`

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Tech Stack

- React 18
- React Router 6
- Tailwind CSS
- Axios for API calls
- Vite as build tool

