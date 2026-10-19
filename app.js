document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('current-date');
  const prevBtn = document.getElementById('prev-day');
  const nextBtn = document.getElementById('next-day');
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');

  // Set initial date to today
  let currentDate = new Date();
  
  // Format Date to YYYY-MM-DD local time
  function formatDate(date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  }

  function updateDateInput() {
    dateInput.value = formatDate(currentDate);
    fetchTodos();
  }

  // Event Listeners for Date Navigation
  dateInput.addEventListener('change', (e) => {
    const parts = e.target.value.split('-');
    currentDate = new Date(parts[0], parts[1] - 1, parts[2]);
    fetchTodos();
  });

  prevBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateInput();
  });

  nextBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateInput();
  });

  // Fetch and Render Todos
  async function fetchTodos() {
    try {
      const dateStr = formatDate(currentDate);
      const res = await fetch(`/api/todos?date=${dateStr}`);
      const todos = await res.json();
      renderTodos(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }

  function renderTodos(todos) {
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
      todoList.innerHTML = '<li class="empty-state">No tasks for this day.</li>';
      return;
    }

    todos.forEach(todo => {
      const li = document.createElement('li');
      if (todo.completed) li.classList.add('completed');

      const titleSpan = document.createElement('span');
      titleSpan.className = 'title';
      titleSpan.textContent = todo.title;

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'actions';

      const completeBtn = document.createElement('button');
      completeBtn.className = 'btn-complete';
      completeBtn.textContent = todo.completed ? '↺ Undo' : '✓ Done';
      completeBtn.onclick = () => toggleComplete(todo.id);

      const moveBtn = document.createElement('button');
      moveBtn.className = 'btn-move';
      moveBtn.textContent = '→ Tomorrow';
      moveBtn.onclick = () => moveToNextDay(todo.id);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.title = 'Delete';
      deleteBtn.onclick = () => deleteTodo(todo.id);

      actionsDiv.appendChild(completeBtn);
      // Only show the move button if the task is not completed
      if (!todo.completed) {
        actionsDiv.appendChild(moveBtn);
      }
      actionsDiv.appendChild(deleteBtn);

      li.appendChild(titleSpan);
      li.appendChild(actionsDiv);
      todoList.appendChild(li);
    });
  }

  // Create a new Todo
  todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = todoInput.value.trim();
    if (!title) return;

    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          date: formatDate(currentDate) // Ensure it is assigned to currently selected date
        })
      });

      todoInput.value = '';
      fetchTodos();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  });

  // Toggle Todo Status
  async function toggleComplete(id) {
    try {
      await fetch(`/api/todos/${id}/toggle`, { method: 'PUT' });
      fetchTodos();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  }

  // Move Todo to Next Day
  async function moveToNextDay(id) {
    try {
      await fetch(`/api/todos/${id}/move`, { method: 'PUT' });
      fetchTodos(); // Refreshes current view (task will disappear from today)
    } catch (error) {
      console.error('Error moving task:', error);
    }
  }

  // Delete Todo
  async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      fetchTodos();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  // Initial Load
  updateDateInput();
});
