# SyncedCalendar

A collaborative calendar web application built with React, TypeScript, Vite, Tailwind CSS, and Firebase.

---

## Prerequisites

Before setting up the project, make sure you have the following installed on your machine:

- **Node.js** (v18 or higher) — [Download here](https://nodejs.org/)
- **Git** — [Download here](https://git-scm.com/)
- A **Firebase account** — [Sign up here](https://firebase.google.com/)

To verify your installations, run:
```bash
node -v
git --version
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/NathanKim16/SyncedCalendar
cd SyncedCalendar
```

---

## 2. Install Dependencies

```bash
npm i
```

---

## 3. Firebase Setup
#### (Using your own Database)

### 3a. Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add Project"** and follow the setup steps
3. Once created, click the **web icon `</>`** to register a web app
4. Copy the `firebaseConfig` object provided

### 3b. Enable Authentication
1. In the Firebase console, go to **Build → Authentication**
2. Click **"Get Started"**
3. Under **Sign-in method**, enable **Email/Password**

### 3c. Set Up Firestore Database
1. Go to **Build → Firestore Database**
2. Click **"Create Database"**
3. Choose **"Start in test mode"** for development
4. Select a region and click **Done**

### 3d. Set Firestore Security Rules
In the Firebase console, go to **Firestore → Rules** and paste the following:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /calendars/{calendarId} {
      allow read, write: if request.auth != null;
    }
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.created_by;
    }
    match /memberships/{membershipId} {
      allow read, write: if request.auth != null;
    }
    match /rsvps/{rsvpId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.user_id;
    }
  }
}
```

---

## 4. Environment Variables

Create a `.env` file in the **project root** (same level as `package.json`):

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Replace each value with the corresponding value from your Firebase `firebaseConfig` object.

---

## 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

---

## 6. Build for Production

```bash
npm run build
```

The production build will be output to the `dist/` folder.

---

## Project Structure

```
SyncedCalendar/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and icons
│   ├── components/         # React components
│   │   ├── CalendarApp.jsx # Main calendar component
│   │   ├── navbar.tsx      # Navigation and sidebar
│   │   └── Login.tsx       # Authentication page
│   ├── context/
│   │   └── auth/
│   │       └── index.jsx   # Firebase Auth context
│   ├── firebase/
│   │   └── auth.ts         # Firebase Auth helper functions
│   ├── services/
│   │   ├── firestoreService.ts  # Firestore CRUD functions
│   │   └── CodeInvite.js        # Calendar invite code logic
│   ├── firebase.ts         # Firebase initialization
│   ├── App.tsx             # Root component and routing
│   ├── main.tsx            # Entry point
│   └── App.css             # Global styles
├── .env                    # Environment variables (not committed)
├── .gitignore
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Database Collections

The app uses the following Firestore collections:

| Collection | Description |
|---|---|
| `users` | User profiles and display names |
| `calendars` | Calendar documents with name, color, and owner |
| `memberships` | Links users to calendars with a role (`owner`, `admin`, `user`) |
| `events` | Calendar events with time, title, and color |
| `rsvps` | User RSVPs for events with optional notes |

---

## Joining a Calendar

Each calendar has an invite code which is the **last 5 characters** of its Firestore document ID, visible at the bottom of the Members panel. Share this code with others so they can join via **"Join with a Code"** in the sidebar.