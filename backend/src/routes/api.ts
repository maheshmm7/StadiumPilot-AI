import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AIService } from '../services/ai.service';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Schema for route request
const routeSchema = z.object({
  startLocation: z.string().optional(),
  destination: z.string().min(1),
  needsWheelchair: z.boolean().default(false),
});

// GET /api/stadium - Returns the current live context of the stadium
router.get('/stadium', async (req, res) => {
  try {
    const zones = await prisma.stadiumZone.findMany({
      include: { incidents: true }
    });
    res.json(zones);
  } catch (error) {
    console.error('Error fetching stadium data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/route - Generates optimal route using GenAI
router.post('/route', async (req, res) => {
  try {
    const { startLocation, destination, needsWheelchair } = routeSchema.parse(req.body);
    const route = await AIService.generateRoute(destination, needsWheelchair, startLocation);
    res.json(route);
  } catch (error: any) {
    console.error('Error in route endpoint:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else {
      res.status(500).json({ error: 'Failed to process route' });
    }
  }
});

// GET /api/digest - Gets the GenAI predictive operations digest
router.get('/digest', async (req, res) => {
  try {
    const digest = await AIService.generateOperationsDigest();
    res.json(digest);
  } catch (error) {
    console.error('Error in digest endpoint:', error);
    res.status(500).json({ error: 'Failed to generate digest' });
  }
});

export default router;
