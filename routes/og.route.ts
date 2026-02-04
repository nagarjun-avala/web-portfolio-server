
import express from 'express';
import OgController from '@/controllers/og.ctrl';

const router = express.Router();

// Generate OG Image
// POST /api/og/generate
router.post('/generate', OgController.generateOg);

export default router;
