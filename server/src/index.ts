import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@bgn/shared';
import { seedGames } from './seedGames';
import { registerPlayerHandlers } from './handlers/playerHandlers';
import { registerSessionHandlers } from './handlers/sessionHandlers';
import { registerChatHandlers } from './handlers/chatHandlers';
import { registerGameLibraryHandlers } from './handlers/gameLibraryHandlers';
import apiRouter from './routes/api';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const IS_PROD = process.env.NODE_ENV === 'production';

const app = express();
const httpServer = createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: IS_PROD ? { origin: false } : { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: IS_PROD ? false : CLIENT_ORIGIN }));
app.use(express.json());
app.use('/api', apiRouter);

if (IS_PROD) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

io.on('connection', (socket) => {
  registerPlayerHandlers(socket, io);
  registerSessionHandlers(socket, io);
  registerChatHandlers(socket, io);
  registerGameLibraryHandlers(socket, io);
});

seedGames();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
