# ✦ TaskFlow

> A modern, fast, private task manager built with vanilla JavaScript — designed to keep your day organized without accounts, servers, or distractions.

<p align="center">
  <a href="https://taskflow-psi-pink.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-TaskFlow-2563EB?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo">
  </a>
  <a href="https://github.com/SREEJITH-16/TASK-FLOW-">
    <img src="https://img.shields.io/badge/Source%20Code-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="Source Code">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=111111" alt="JavaScript">
  <img src="https://img.shields.io/badge/localStorage-Client--Side-16A34A?style=flat-square" alt="localStorage">
  <img src="https://img.shields.io/badge/Responsive-Yes-7C3AED?style=flat-square" alt="Responsive">
</p>

---

## 🚀 Live Demo

### [→ Open TaskFlow](https://taskflow-psi-pink.vercel.app/)

TaskFlow runs entirely in the browser, so your tasks stay available across page refreshes without requiring an account or backend.

---

## ✨ Overview

TaskFlow is a polished client-side task management application focused on simple state management, smooth interactions, and persistent browser storage.

It combines a clean productivity dashboard with practical task-management features:

- ✅ Full CRUD task management
- 💾 Persistent data using `window.localStorage`
- 🔎 Real-time search
- 🎯 Status and priority filters
- ↕️ Multiple sorting modes
- 📊 Live productivity statistics
- 🌙 Light / dark theme
- 📱 Responsive layout for desktop and mobile
- 🔔 Toast notifications and undo actions
- ♿ Accessible keyboard and focus interactions

No account. No server. No database. Just open it and start managing your tasks.

---

## 🎯 Features

### Task Management
- Create tasks with title, description, priority, and due date
- Edit existing tasks
- Mark tasks as completed or active
- Delete individual tasks
- Clear all completed tasks
- Mark all active tasks as completed

### Smart Organization
- **All** tasks
- **Active** tasks
- **Completed** tasks
- Search by task title or description
- Filter by **High / Medium / Low** priority
- Sort by:
  - Newest first
  - Oldest first
  - Due date
  - Priority

### Progress Dashboard
TaskFlow automatically calculates:

| Metric | Description |
|---|---|
| **Total** | Number of saved tasks |
| **Active** | Tasks still in progress |
| **Completed** | Finished tasks |
| **Overdue** | Incomplete tasks past their due date |
| **Completion** | Percentage of completed tasks |

The progress ring and counters update automatically whenever task state changes.

### 💾 Persistent Storage

Tasks are stored locally using the browser's `localStorage` API.

That means:

- Data survives browser refreshes
- Data remains after closing and reopening the browser
- No login is required
- No backend is required
- The app can work without a server after it has loaded

Storage keys used by the application:

```text
todo_app_tasks
todo_app_theme
```

### 🌗 Theme Support

TaskFlow supports:

- Light mode
- Dark mode
- System theme preference on first visit
- Theme persistence across sessions

### 🔔 Notifications

The built-in toast system provides feedback for actions such as:

- Task added
- Task updated
- Task completed
- Task deleted
- Completed tasks cleared

Deleting a task also supports an **Undo** action.

---

## 🎨 UI & UX

TaskFlow is designed around a modern productivity-dashboard experience.

### Design characteristics

- Clean visual hierarchy
- Soft cards and borders
- Responsive spacing
- Subtle shadows
- Smooth transitions
- Interactive task cards
- Animated progress ring
- Modal-based task creation/editing
- Mobile-friendly controls
- Accessible focus states

The interface intentionally stays lightweight while still providing a polished product-like experience.

---

## 🧠 JavaScript & State Management

The application keeps a single client-side state object containing:

```js
{
  tasks: [],
  status: "all",
  priority: "all",
  sort: "newest",
  query: "",
  editingId: null
}
```

Task objects follow a structure similar to:

```js
{
  id: "unique-id",
  title: "Finish project documentation",
  description: "Complete the final README and notes.",
  priority: "high",
  dueDate: "2026-10-11",
  completed: false,
  createdAt: 1780000000000
}
```

The UI is then rendered from the current state, keeping the interface synchronized with stored data.

---

## 🧩 Core JavaScript Architecture

The application is organized around reusable functions for:

```text
Storage
 ├─ loadTasks()
 └─ saveTasks()

CRUD
 ├─ createTask()
 ├─ updateTask()
 ├─ deleteTask()
 └─ toggleTask()

Filtering
 ├─ searchTasks()
 └─ filterTasks()

Rendering
 ├─ renderTasks()
 ├─ renderStats()
 ├─ renderEmpty()
 └─ renderFilterStates()

UI
 ├─ openModal()
 ├─ closeModal()
 ├─ showToast()
 └─ applyTheme()
```

Dynamic task elements are created with JavaScript rather than hardcoded individually in HTML.

---

## ⚡ Event Delegation

Task actions use event delegation on the task list.

This keeps event handling efficient even when the task list is dynamically rebuilt.

Examples include:

- Complete / uncomplete
- Edit
- Delete

The application also uses event-driven updates for filters, search, sorting, theme switching, modal controls, and keyboard shortcuts.

---

## ⌨️ Keyboard & Accessibility

TaskFlow includes accessibility-focused interactions such as:

- Semantic HTML
- Form labels
- Visible focus indicators
- ARIA labels
- Keyboard-accessible buttons
- Escape key to close dialogs
- Focus containment inside dialogs
- Reduced-motion support

### Keyboard shortcut

Press:

```text
N
```

to open the **Add Task** dialog when you are not typing inside a form control.

---

## 📱 Responsive Design

The layout adapts across:

- 🖥️ Desktop
- 💻 Laptop
- 📲 Tablet
- 📱 Mobile

On smaller screens the dashboard reorganizes automatically, task actions remain touch-friendly, and controls adapt without introducing horizontal overflow.

---

## 🛡️ Robustness

TaskFlow includes defensive handling for common client-side edge cases:

- Invalid or corrupted localStorage data
- Duplicate task IDs
- Missing/invalid task properties
- Empty task titles
- Storage failures
- Search with no matches
- Empty task collections
- No active tasks
- No completed tasks

User-generated task content is rendered safely using DOM APIs rather than relying on unsafe string injection.

---

## 📂 Project Structure

```text
TASK-FLOW-/
│
├── index.html      # Application structure and accessible UI
├── style.css       # Responsive styling, themes and animations
├── script.js       # State management, CRUD, filtering and rendering
└── README.md       # Project documentation
```

---

## 🛠️ Tech Stack

### Frontend

- **HTML5** — semantic application structure
- **CSS3** — responsive layout, themes, transitions and animations
- **Vanilla JavaScript (ES6+)** — application logic and state management

### Browser APIs

- `localStorage`
- `crypto.randomUUID()`
- `matchMedia()`
- DOM APIs
- Browser events

### Deployment

- Vercel

---

## ▶️ Run Locally

TaskFlow does not require a build tool or package installation.

### Option 1 — Open directly

Clone the repository:

```bash
git clone https://github.com/SREEJITH-16/TASK-FLOW-.git
cd TASK-FLOW-
```

Then open:

```text
index.html
```

in your browser.

### Option 2 — Use a local development server

With VS Code, open the folder and launch `index.html` using a local server such as Live Server.

---

## 🌐 Deployment

Because TaskFlow is a static frontend application, it can be deployed easily to services such as Vercel, Netlify, or GitHub Pages.

### Vercel

1. Import the GitHub repository
2. Select the project
3. No build command is required
4. Deploy

### Live Deployment

**https://taskflow-psi-pink.vercel.app/**

---

## 🔄 Application Flow

```text
User Action
     ↓
Update State
     ↓
Save to localStorage
     ↓
Re-render UI
     ↓
Refresh-safe persistent state
```

For example:

```text
Add Task
   ↓
Create task object
   ↓
Insert into state.tasks
   ↓
saveTasks()
   ↓
render()
   ↓
Updated dashboard
```

---

## 🧪 Feature Checklist

| Feature | Status |
|---|:---:|
| Create task | ✅ |
| Read/display tasks | ✅ |
| Edit task | ✅ |
| Delete task | ✅ |
| Mark complete | ✅ |
| localStorage persistence | ✅ |
| Search | ✅ |
| Status filtering | ✅ |
| Priority filtering | ✅ |
| Sorting | ✅ |
| Progress statistics | ✅ |
| Overdue detection | ✅ |
| Dark mode | ✅ |
| Toast notifications | ✅ |
| Undo delete | ✅ |
| Responsive UI | ✅ |
| Keyboard support | ✅ |
| Reduced-motion support | ✅ |

---

## 📸 Preview

<p align="center">
  <a href="https://taskflow-psi-pink.vercel.app/">
    <img src="https://placehold.co/1200x650/EEF3FF/173B8F?text=TaskFlow+%7C+Modern+Task+Management+Dashboard" alt="TaskFlow Preview">
  </a>
</p>

> Replace the preview image above with a real screenshot of the deployed application whenever you have one available.

---

## 🔐 Privacy

TaskFlow is designed around client-side storage.

There is no application account system or remote task database. Task data is stored in the browser through `localStorage`.

Clearing the site's browser storage will remove locally stored tasks.

---

## 📌 Project Links

| Resource | Link |
|---|---|
| 🌐 Live App | https://taskflow-psi-pink.vercel.app/ |
| 💻 GitHub Repository | https://github.com/SREEJITH-16/TASK-FLOW- |

---

## 💡 Possible Future Enhancements

Potential improvements for future versions include:

- Drag-and-drop task ordering
- Recurring tasks
- Calendar view
- Task labels/tags
- Browser notifications
- Data export/import
- Cloud synchronization
- Multi-device task sync
- PWA / installable app support

---

<p align="center">
  <strong>TaskFlow</strong><br>
  Simple tasks. Clear progress. Better focus.
</p>
