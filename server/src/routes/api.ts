import { Router } from 'express';
import { getAllGames, getAllSessions, getSessionSummary } from '../store';

const router = Router();
const startTime = Date.now();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: Math.floor((Date.now() - startTime) / 1000) });
});

router.get('/games', (_req, res) => {
  res.json(getAllGames());
});

router.get('/sessions', (_req, res) => {
  res.json(getAllSessions().map(getSessionSummary));
});

export default router;
