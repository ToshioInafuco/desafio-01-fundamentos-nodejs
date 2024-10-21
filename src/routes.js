import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';
import { csvFile } from './middleware/csvFile.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        'tasks',
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: async (req, res) => {
      if (req.headers['content-type'].startsWith('multipart/form-data')) {
        const csvData = await csvFile(req);

        for await (const data of csvData) {
          const [title, description] = data.split(',');

          if (
            !title ||
            title == '' ||
            !description ||
            description == '' ||
            title == 'title' ||
            description == 'description'
          ) {
            continue;
          }

          const task = {
            id: randomUUID(),
            title,
            description,
            completed_at: null,
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
          };

          database.insert('tasks', task);
        }

        return res.writeHead(201).end('Arquivo processado');
      }

      const { title, description } = req.body;

      if (!title || !description) {
        return res.writeHead(400).end(`title e description obrigatórios`);
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      };
      database.insert('tasks', task);

      return res.writeHead(201).end();
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params;

      const task = database.select('tasks', { id });

      if (task.length < 1) {
        return res.writeHead(404).end('Task não encontrada');
      }

      task[0].completed_at = new Date().getTime();

      database.update('tasks', id, task[0]);

      return res.writeHead(204).end();
    },
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      const task = database.select('tasks', { id });

      if (task.length < 1) {
        return res.writeHead(404).end('Task não encontrada');
      }

      database.delete('tasks', id);

      return res.writeHead(204).end();
    },
  },
];
