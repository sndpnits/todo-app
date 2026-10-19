# Daily TODO App

A lightweight, lightning-fast daily task manager. 
This application requires **zero external dependencies** and uses built-in Node.js modules to run. It saves your data locally, so no external database setup is required!

## Features

- **Daily View**: See tasks assigned to specific dates.
- **Easy Navigation**: Browse past and future days with a built-in calendar or navigation buttons.
- **Task Management**:
  - Add new tasks for any specific day.
  - Mark tasks as `✓ Done` or `↺ Undo` them.
  - Move incomplete tasks to `→ Tomorrow` with a single click.
  - Delete (`×`) tasks permanently.
- **Zero Configuration**: Uses a local JSON file (`todos.json`) as a database.

## Prerequisites

All you need is **Node.js** installed on your machine.
- [Download Node.js here](https://nodejs.org/)

## Getting Started

1. **Open your terminal** and navigate to this project folder:
   ```bash
   cd path/to/todo-app
   ```

2. **Start the server**:
   ```bash
   node server.js
   ```
   *(Note: You do not need to run `npm install` because this project has 0 dependencies!)*

3. **Open the app**:
   Open your web browser and navigate to:
   **[http://localhost:3000](http://localhost:3000)**

## Project Structure

- `server.js` - The zero-dependency Node.js backend server and API.
- `public/` - The frontend files:
  - `index.html` - The UI structure.
  - `style.css` - The compact, clean styling.
  - `app.js` - The frontend logic connecting to the API.
  - `favicon.svg` - The browser tab icon.
- `todos.json` - Auto-generated data file where your tasks are saved.

## Troubleshooting

- **Address in use?** If port `3000` is already taken, you can change the `PORT` variable at the top of `server.js`.
- **Data reset?** If you ever want to completely wipe your tasks, just delete the `todos.json` file. It will be automatically recreated the next time you start the server.
