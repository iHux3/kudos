import express from 'express';
import { handleCreateKudos, handleListKudos } from './kudos.service';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

export const createApp = () => {
  const app = express();
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // remove for production
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

    if (_req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    return next();
  });
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.send({ message: 'Hello API' });
  });

  app.post('/kudos', async (req, res) => {
    const result = await handleCreateKudos({
      senderIdHeader: req.header('x-user-id'),
      body: req.body,
    });

    return res.status(result.status).json(result.body);
  });

  app.get('/kudos', async (req, res) => {
    const result = await handleListKudos({
      query: req.query,
    });

    return res.status(result.status).json(result.body);
  });

  return app;
};

if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });
}
