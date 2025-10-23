# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nexboard is a Next.js-based Progressive Web App (PWA) for project and task management. Users can create projects with user stories, manage tasks through a kanban-style board (New/Active/Resolved), track time estimations vs actual completion time, and use a built-in stopwatch for time tracking.

## Commands

### Development
```bash
npm run dev         # Start development server at http://localhost:3000
npm run build       # Build production bundle
npm start           # Start production server
npm run lint        # Run Next.js linter
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (Pages Router)
- **UI Library**: Material-UI (MUI) v5
- **Backend**: Firebase (Authentication + Firestore)
- **PWA**: next-pwa for Progressive Web App capabilities
- **Language**: TypeScript with some legacy JavaScript files

### Project Structure

```
src/
├── pages/              # Next.js pages (Pages Router)
│   ├── index.tsx      # Landing page with login/register
│   ├── dashboard/     # Main project/task management dashboard
│   ├── task/          # Individual task edit page
│   └── _app.tsx       # App wrapper with AuthContext provider
├── components/
│   ├── Login/         # Login component
│   ├── Register/      # Registration component
│   ├── Stopwatch/     # Time tracking stopwatch
│   ├── Loader/        # Loading spinner
│   └── firebase.js    # Firebase configuration
├── context/
│   └── AuthContext.js # Global auth and state management
└── styles/            # Global CSS and CSS modules
```

### Key Architectural Patterns

**Authentication & Global State**
- `AuthContext` (src/context/AuthContext.js) provides global state via React Context
- Manages: user authentication, current project selection, current task selection
- Use `UserAuth()` hook to access: `user`, `signup`, `login`, `logout`, `currentTask`, `handleSelectedTask`, `project`, `setProject`

**Firebase Data Structure**
```
users/{userId}
  └── projects: [
        {
          id: string (uuid),
          name: string,
          userStory: string,
          tasks: [
            {
              id: string (uuid),
              number: number (display order),
              heading: string,
              description: string,
              estimation: number (hours),
              completed: number (hours),
              status: "new" | "active" | "resolved",
              created: Date
            }
          ]
        }
      ]
```

**Data Access Pattern**
- All Firestore operations use `doc(db, "users", user.uid)` to get user document reference
- Read user data with `getDoc()`, write with `setDoc()` (full document replacement)
- When updating projects/tasks: fetch all projects, modify specific one, filter others, write back entire array
- Example: To update a task, find the project, filter out old task, push updated task, update entire projects array

**Navigation Flow**
1. Landing page (`/`) - Login/Register with toggle
2. Dashboard (`/dashboard`) - Project selection, task board (New/Active/Resolved columns), project management
3. Task page (`/task`) - Edit individual task details
- Task selection uses `handleSelectedTask()` from AuthContext to pass task data between dashboard and task page

**Task Status Workflow**
- Tasks flow: New → Active → Resolved
- Status can be moved up (forward arrow) or down (backward arrow)
- Estimation accuracy calculated as `estimation - completed` (shown in parentheses)
  - Green: completed under estimate
  - Red: completed over estimate
  - Yellow: exact match

**PWA Configuration**
- Configured via next-pwa in next.config.js
- Service worker generated in public/sw.js
- Manifest at public/manifest.json with theme color #FFF0BC

### Important Files

- `src/components/firebase.js` - Firebase initialization (currently has exposed API key - should use environment variables)
- `src/pages/dashboard/index.tsx` - Main application logic (1169 lines)
- `src/pages/task/index.tsx` - Task editing interface
- `src/context/AuthContext.js` - Global state management hub

## Development Notes

### Path Aliases
- `@/*` maps to `./src/*` (configured in tsconfig.json)

### Mixed TypeScript/JavaScript
- Most pages/components are TypeScript (.tsx)
- AuthContext and firebase config are JavaScript (.js)
- When modifying AuthContext or firebase, maintain JavaScript syntax

### Firebase Operations
- Always wrap Firestore operations in try-catch blocks
- Show toast notifications using react-toastify for success/error states
- Use loading states during async operations (CircularIndeterminate component)

### UI Patterns
- Material-UI components for forms, buttons, modals
- Modal overlays use className-based click-outside detection
- Responsive design using ref-based width calculations
- Toast position: "top-center" for all notifications
