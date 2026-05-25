import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getData } from '../lib/db';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // In a real app, we'd query the DB. For now, using a mock check for the "first run"
    if (email === 'admin@emdecob.com' && password === 'admin123') {
      const token = jwt.sign({ userId: 'admin', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, user: { email, role: 'ADMIN', name: 'EMDECOB Admin' } });
    }

    // Only mock admin is supported
    return res.status(401).json({ message: 'Credenciales inválidas' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;
