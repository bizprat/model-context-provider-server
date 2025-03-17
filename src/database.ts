import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
}

const DB_NAME = '/todos.sqlite';
const DB_DIR = '/tmp/todos';

const dataDir = resolve(DB_DIR);
console.error(`Database directory: ${dataDir}`);

if (!existsSync(dataDir)) {
  console.error(`Creating database directory...`);
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(DB_DIR, DB_NAME);
console.error(`Database file: ${dbPath}`);

const db = new Database(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    )
  `);

// Add a todo
export const addTodo = (text: string): Todo => {
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(
    'INSERT INTO todos (text, completed, createdAt) VALUES (?, 0, ?)'
  );
  const todo = stmt.run(text, createdAt);

  return {
    id: Number(todo.lastInsertRowid),
    text,
    completed: false,
    createdAt,
  };
};

// Get all todos
export const getTodos = (): Todo[] => {
  const stmt = db.prepare('SELECT * FROM todos');
  return stmt.all() as Todo[];
};

// Get a todo by id
export const getTodoById = (
  id: number
): Todo | undefined => {
  const stmt = db.prepare(
    'SELECT * FROM todos WHERE id = ?'
  );
  const todo = stmt.get(id) as Todo | undefined;
  return todo;
};

// Update a todo
export const updateTodo = (
  id: number,
  todo: Todo
): Todo => {
  const stmt = db.prepare(
    'UPDATE todos SET text = ?, completed = ? WHERE id = ?'
  );
  const updatedTodo = stmt.run(
    todo.text,
    todo.completed ? 1 : 0,
    id
  );
  return {
    ...todo,
    id: Number(updatedTodo.lastInsertRowid),
  };
};

// Delete a todo
export const deleteTodo = (id: number): boolean => {
  const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
};
