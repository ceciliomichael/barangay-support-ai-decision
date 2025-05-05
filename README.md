# Barangay Waste Management System

A complete waste management system with both admin and resident dashboards. The system uses MongoDB for data storage and Mistral AI for automated verification of waste concerns.

## Features

### Admin Dashboard
- Modern admin dashboard UI with Tailwind CSS v4
- AI-powered verification of waste management concerns
- Filter concerns by status (pending, legitimate, nonsense)
- Statistics overview of concern status
- Responsive design for all device sizes

### Resident Dashboard
- Simple interface for residents to submit waste concerns
- Real-time status tracking of submitted concerns
- Automatic AI verification of concerns
- User authentication (simplified for demo)

## Use Case

This system is designed for Barangay waste management:

1. Residents submit waste management concerns through the resident dashboard
2. The system automatically processes the concerns using Mistral AI
3. The AI determines if each concern is legitimate or nonsense
4. Administrators can view all concerns and their statuses on the admin dashboard
5. Administrators can override AI decisions if needed

## Technical Implementation

- **Frontend**: React, TypeScript, Tailwind CSS v4
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI Integration**: Mistral AI API for automatic verification
- **Data Flow**: Residents submit concerns → MongoDB storage → AI verification → Status update

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up MongoDB:
   - Install MongoDB locally or use a cloud service
   - Create a database named "waste_management"
   
4. Set up your `.env` file:
   - The `.env` file should contain the following:
     ```
     # Mistral AI API
     VITE_MISTRAL_API_URL=https://api.mistral.ai/v1
     VITE_MISTRAL_API_KEY=your_mistral_api_key
     VITE_MISTRAL_MODEL=mistral-small-latest
     VITE_MAX_TOKENS=4000
     VITE_TEMPERATURE=0.4

     # MongoDB Connection
     MONGODB_URI=mongodb://localhost:27017/waste_management
     MONGODB_DB_NAME=waste_management

     # API URL
     VITE_API_URL=http://localhost:5000/api
     ```

## Running the Application

Start both the frontend and backend:

```
npm run dev
```

This will start:
- Frontend: http://localhost:5173 (or another port if 5173 is in use)
- Backend API: http://localhost:5000/api

## Demo Usage

1. Switch between the admin and resident views using the toggles at the top
2. In the resident view:
   - Sign in with your name and email (or use the test account)
   - Submit waste management concerns
   - View the status of your concerns
3. In the admin view:
   - See all concerns from all residents
   - View AI verification results
   - Override verification if needed

## Technologies Used

- React 19
- TypeScript
- Tailwind CSS v4
- Vite
- Node.js
- Express
- MongoDB
- Mongoose
- Mistral AI API
