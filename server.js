const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'todos.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Initialize local JSON data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

function readTodos() {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

function writeTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// Helper to set correct Content-Type for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
};

const server = http.createServer((req, res) => {
  // Parse URL to route requests
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;

  // --- API ROUTES ---
  if (pathname.startsWith('/api/todos')) {
    res.setHeader('Content-Type', 'application/json');

    // 1. GET /api/todos?date=YYYY-MM-DD
    if (req.method === 'GET') {
      const dateParam = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      const todos = readTodos();
      
      const filteredTodos = todos.filter(t => {
        const tDate = new Date(t.date).toISOString().split('T')[0];
        return tDate === dateParam;
      });
      
      res.writeHead(200);
      return res.end(JSON.stringify(filteredTodos.reverse())); // newest first
    }

    // 2. POST /api/todos
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        const { title, date } = JSON.parse(body);
        const todos = readTodos();
        
        const newTodo = {
          id: Date.now().toString(),
          title,
          completed: false,
          date: date ? new Date(date).toISOString() : new Date().toISOString()
        };
        
        todos.push(newTodo);
        writeTodos(todos);
        
        res.writeHead(201);
        return res.end(JSON.stringify(newTodo));
      });
      return;
    }

    // 3. PUT /api/todos/:id/toggle OR move
    if (req.method === 'PUT') {
      const parts = pathname.split('/');
      const id = parts[3];
      const action = parts[4]; // 'toggle' or 'move'

      const todos = readTodos();
      const todoIndex = todos.findIndex(t => t.id === id);

      if (todoIndex === -1) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Todo not found' }));
      }

      if (action === 'toggle') {
        todos[todoIndex].completed = !todos[todoIndex].completed;
      } else if (action === 'move') {
        const current = new Date(todos[todoIndex].date);
        current.setDate(current.getDate() + 1);
        todos[todoIndex].date = current.toISOString();
        todos[todoIndex].completed = false; // reset status on move
      }

      writeTodos(todos);
      res.writeHead(200);
      return res.end(JSON.stringify(todos[todoIndex]));
    }
  }

  // --- STATIC FILE SERVING ---
  const filePath = path.join(PUBLIC_DIR, pathname);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Zero-dependency server running on http://localhost:${PORT}`);
});
