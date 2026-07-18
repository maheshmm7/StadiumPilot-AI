import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from './server';

// Mock the AI service to not hit the real API during tests
vi.mock('./services/ai.service', () => ({
  AIService: {
    generateRoute: vi.fn().mockResolvedValue({
      optimalRoute: ['Main Entrance', 'West Concourse'],
      eta: '5 mins',
      aiSummary: 'Mocked route for testing'
    }),
    generateOperationsDigest: vi.fn().mockResolvedValue({
      status: 'Nominal',
      criticalAlert: 'None',
      recommendations: ['Test recommendation']
    })
  }
}));

describe('StadiumPilot API', () => {
  it('GET /api/stadium should return stadium zones', async () => {
    const res = await request(app).get('/api/stadium');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/route should generate a route', async () => {
    const res = await request(app)
      .post('/api/route')
      .send({
        destination: 'Gate A - North',
        needsWheelchair: true,
        startLocation: 'Main Entrance'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('optimalRoute');
    expect(res.body.eta).toBe('5 mins');
    expect(res.body.aiSummary).toBe('Mocked route for testing');
  });

  it('GET /api/digest should return the operations digest', async () => {
    const res = await request(app).get('/api/digest');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'Nominal');
    expect(res.body.recommendations).toHaveLength(1);
  });
});
