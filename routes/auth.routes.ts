import express from 'express';
import { login, register, logout, getMe } from '../controllers/auth.ctrl';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);

export default router;
