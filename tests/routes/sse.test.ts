import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { EventEmitter } from 'node:events';
import { createSseRoutes } from '../../src/routes/sse.js';

class MockMonitor extends EventEmitter {
  getStatus(name: string) {
    return 'down';
  }
  getAllStatuses() {
    return [{ name: 'Plex', status: 'down' }];
  }
}

describe('SSE routes', () => {
  it('GET /sse/all returns event-stream content type', async () => {
    const monitor = new MockMonitor();
    const app = express();
    app.use('/', createSseRoutes(monitor as any));

    const res = await request(app)
      .get('/sse/all')
      .buffer(true)
      .parse((res, callback) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        setTimeout(() => {
          res.emit('end');
          callback(null, data);
        }, 50);
      });

    expect(res.headers['content-type']).toContain('text/event-stream');
  });

  it('GET /sse/:service sends initial status', async () => {
    const monitor = new MockMonitor();
    const app = express();
    app.use('/', createSseRoutes(monitor as any));

    const res = await request(app)
      .get('/sse/Plex')
      .buffer(true)
      .parse((res, callback) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        setTimeout(() => {
          res.emit('end');
          callback(null, data);
        }, 50);
      });

    expect(res.body).toContain('data:');
  });
});
