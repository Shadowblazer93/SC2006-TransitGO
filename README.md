# My Mobile App

This project is a mobile application that consists of a FastAPI backend and a React.js frontend. The backend serves as a REST API to handle data interactions, while the frontend provides a user interface for the mobile app.

## Project Structure

```
my-mobile-app
├── backend
│   ├── app
│   │   ├── main.py
│   │   ├── api
│   │   │   └── routes.py
│   │   ├── models
│   │   │   └── user.py
│   │   └── schemas
│   │       └── user.py
│   ├── requirements.txt
│   └── README.md
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── pages
│   │   │    ├──Login.js
│   │   │    ├──NewAccount.js
│   │   │    ├──ChangePassword.js
│   │   │    ├──ResetPassword.js
│   │   │    ├──Admin Pages
│   │   │    │    ├──AdminMainPage.js
│   │   │    │    ├──AdminAnnoucement.js
│   │   │    │    ├──AdminUserFeedback.js
│   │   │    │    ├──AdminUserAccounts.js
│   │   │    │    ├──AdminSystemMetrics.js
│   │   │    │    ├──AdminIssueHeatmaps.js
│   │   │    │    ├──AdminProfile.js
│   │   │    ├──User Pages
│   │   │    │    ├──UserMainPage.js
│   │   │    │    ├──InteractiveMap.js
│   │   │    │    ├──FareEstimation.js
│   │   │    │    ├──TravelTime.js
│   │   │    │    ├──SavedList.js
│   │   │    │    ├──TripHistory.js
│   │   │    │    ├──PlatformCrowsdedness.js
│   │   │    │    ├──ServiceAvailability.js
│   │   │    │    ├──UserFeedback.js
│   │   │    │    ├──UserProfile.js
│   │   │    │    ├──Favourites.js
│   │   │    │    ├──DownloadedArea.js
│   │   │    │    ├──Accessibility.js
│   │   ├── components
│   │   │   └── UserComponent.js
│   │   └── services
│   │       └── api.js
│   ├── package.json
│   └── README.md
```

## Backend Setup

1. Navigate to the `backend` directory.
2. Install the required dependencies using pip:
   ```
   pip install -r requirements.txt
   ```
3. Run the FastAPI application:
   ```
   uvicorn app.main:app --reload
   ```

## Frontend Setup

1. Navigate to the `frontend` directory.
2. Install the required dependencies using npm:
   ```
   npm install
   ```
3. Start the React application:
   ```
   npm start
   ```

## API Documentation

Refer to the `backend/README.md` for detailed API usage and endpoints.

## Frontend Documentation

Refer to the `frontend/README.md` for detailed information on the frontend setup and components.
