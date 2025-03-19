import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  addTodo,
  deleteTodo,
  getTodoById,
  getTodos,
  updateTodo,
} from './database.js';

const server = new McpServer({
  name: 'TODO',
  version: '1.0.0',
});

// Tools
server.tool(
  'add-todo',
  'Adds new todo',
  { text: z.string() },
  async ({ text }) => {
    const todo = addTodo(text);

    return {
      content: [
        {
          type: 'text',
          text: `"${text}" was successfully added to your To Do list with ID: ${todo.id}`,
        },
      ],
    };
  }
);

server.tool(
  'get-todos',
  'Lists all ToDos',
  {},
  async () => {
    const todos = getTodos();

    if (todos.length === 0)
      return {
        content: [
          {
            type: 'text',
            text: 'You have no To Do items.',
          },
        ],
      };

    const todoList = todos
      .map(
        (todo) =>
          `- ${todo.id}: ${todo.text} - ${
            todo.completed ? 'Completed' : 'Not Completed'
          }`
      )
      .join('\n');
    return {
      content: [
        {
          type: 'text',
          text: `You have ${todos.length} To Do item(s):\n${todoList}`,
        },
      ],
    };
  }
);

server.tool(
  'complete-todo',
  'Mark ToDo as complete',
  { id: z.number() },
  async ({ id }) => {
    const todo = getTodoById(id);
    if (!todo)
      return {
        content: [
          {
            type: 'text',
            text: `To Do item with ID ${id} not found.`,
          },
        ],
      };

    const updatedTodo = updateTodo(id, {
      ...todo,
      completed: true,
    });
    return {
      content: [
        {
          type: 'text',
          text: `"${updatedTodo.text}" was successfully marked as completed.`,
        },
      ],
    };
  }
);

server.tool(
  'delete-todo',
  'Deletes ToDo',
  { id: z.number() },
  async ({ id }) => {
    const success = deleteTodo(id);
    if (!success)
      return {
        content: [
          {
            type: 'text',
            text: `To Do item with ID ${id} not found.`,
          },
        ],
      };

    return {
      content: [
        {
          type: 'text',
          text: `"To Do item with ID ${id}" was successfully deleted.`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('Server is running...');
}

main()
  .then(() => {
    const todo = getTodoById(1);

    if (!todo) return;

    console.log(
      updateTodo(todo.id, {
        ...todo,
        completed: true,
      })
    );
  })
  .catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
  });
