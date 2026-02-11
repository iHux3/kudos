import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/main';
import { closeDb, db, runMigrations } from '../src/db/client';
import { kudosTable } from '../src/db/schema';
import { createKudos, listKudos } from '../src/db/kudos.repository';

describe('@kudos/backend kudos API', () => {
  const SENDER_ID_A = '11111111-1111-4111-8111-111111111111';
  const RECEIVER_ID_A = '22222222-2222-4222-8222-222222222222';
  const SENDER_ID_B = '33333333-3333-4333-8333-333333333333';
  const RECEIVER_ID_B = '44444444-4444-4444-8444-444444444444';

  const seedKudosWithCreatedAt = async (items: Array<{ createdAt: Date; message: string }>) => {
    await db.insert(kudosTable).values(
      items.map((item, index) => ({
        senderId: SENDER_ID_A,
        receiverId: RECEIVER_ID_A,
        message: item.message,
        category: 'Teamwork' as const,
        createdAt: item.createdAt,
        id: `00000000-0000-4000-8000-00000000000${index + 1}`,
      }))
    );
  };

  let app: Express;

  beforeAll(async () => {
    runMigrations();
    app = createApp();
  });

  beforeEach(async () => {
    await db.delete(kudosTable);
  });

  afterAll(async () => {
    closeDb();
  });

  it('POST /kudos creates a new kudos item', async () => {
    const response = await request(app)
      .post('/kudos')
      .set('x-user-id', SENDER_ID_A)
      .send({
        receiverId: RECEIVER_ID_A,
        message: 'Great support on the release!',
        category: 'Teamwork',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      senderId: SENDER_ID_A,
      receiverId: RECEIVER_ID_A,
      message: 'Great support on the release!',
      category: 'Teamwork',
    });
    expect(response.body.createdAt).toBeTypeOf('string');
  });

  it('GET / returns service health payload', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello API' });
  });

  it('POST /kudos validates missing x-user-id header', async () => {
    const response = await request(app).post('/kudos').send({
      receiverId: RECEIVER_ID_A,
      message: 'Thanks!',
      category: 'Thank You',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid x-user-id header.');
  });

  it('POST /kudos validates invalid request body', async () => {
    const response = await request(app)
      .post('/kudos')
      .set('x-user-id', SENDER_ID_A)
      .send({
        receiverId: 'not-a-uuid',
        message: 'Thanks!',
        category: 'Thank You',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid request body.');
  });

  it('GET /kudos respects limit and offset', async () => {
    await request(app)
      .post('/kudos')
      .set('x-user-id', SENDER_ID_B)
      .send({
        receiverId: RECEIVER_ID_B,
        message: 'A',
        category: 'Great Job',
      });

    await request(app)
      .post('/kudos')
      .set('x-user-id', SENDER_ID_B)
      .send({
        receiverId: RECEIVER_ID_B,
        message: 'B',
        category: 'Great Job',
      });

    const response = await request(app).get('/kudos?limit=1&offset=1');

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      limit: 1,
      offset: 1,
      count: 1,
    });
    expect(response.body.items).toHaveLength(1);
  });

  it('GET /kudos applies default pagination values', async () => {
    await request(app)
      .post('/kudos')
      .set('x-user-id', SENDER_ID_A)
      .send({
        receiverId: RECEIVER_ID_A,
        message: 'First item',
        category: 'Great Job',
      });
    await request(app)
      .post('/kudos')
      .set('x-user-id', SENDER_ID_B)
      .send({
        receiverId: RECEIVER_ID_B,
        message: 'Second item',
        category: 'Teamwork',
      });

    const response = await request(app).get('/kudos');

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      limit: 20,
      offset: 0,
      count: 2,
    });
    expect(response.body.items).toHaveLength(2);
  });

  it('GET /kudos validates invalid query params', async () => {
    const response = await request(app).get('/kudos?limit=101');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid query params.');
  });

  it('GET /kudos returns empty list for clean database', async () => {
    const response = await request(app).get('/kudos');

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
    expect(response.body.pagination).toEqual({
      limit: 20,
      offset: 0,
      count: 0,
    });
  });

  it('repository createKudos returns dto with ISO timestamp', async () => {
    const created = await createKudos({
      senderId: SENDER_ID_A,
      receiverId: RECEIVER_ID_A,
      message: 'Repository message',
      category: 'Teamwork',
    });

    expect(created.id).toBeTypeOf('string');
    expect(created.createdAt).toBeTypeOf('string');
    expect(new Date(created.createdAt).toISOString()).toBe(created.createdAt);
  });

  it('repository listKudos respects sorting and pagination', async () => {
    await seedKudosWithCreatedAt([
      { createdAt: new Date('2024-01-01T00:00:00.000Z'), message: 'old' },
      { createdAt: new Date('2024-01-02T00:00:00.000Z'), message: 'middle' },
      { createdAt: new Date('2024-01-03T00:00:00.000Z'), message: 'new' },
    ]);

    const firstPage = await listKudos({ limit: 2, offset: 0 });
    const secondPage = await listKudos({ limit: 2, offset: 2 });

    expect(firstPage).toHaveLength(2);
    expect(firstPage.map((item) => item.message)).toEqual(['new', 'middle']);
    expect(secondPage).toHaveLength(1);
    expect(secondPage[0].message).toBe('old');
  });
});
