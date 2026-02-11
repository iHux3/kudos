import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleCreateKudos,
  handleListKudos,
  type KudosServiceDependencies,
} from '../src/kudos.service';

describe('@kudos/backend kudos service unit', () => {
  const SENDER_ID = '11111111-1111-4111-8111-111111111111';
  const RECEIVER_ID = '22222222-2222-4222-8222-222222222222';
  let dependencies: KudosServiceDependencies;

  beforeEach(() => {
    dependencies = {
      createKudos: vi.fn(),
      listKudos: vi.fn(),
    };
  });

  it('handleCreateKudos validates missing x-user-id header', async () => {
    const result = await handleCreateKudos(
      {
        senderIdHeader: undefined,
        body: {
          receiverId: RECEIVER_ID,
          message: 'Thanks!',
          category: 'Thank You',
        },
      },
      dependencies
    );

    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({
      message: 'Invalid x-user-id header.',
    });
    expect(dependencies.createKudos).not.toHaveBeenCalled();
  });

  it('handleCreateKudos validates invalid x-user-id header format', async () => {
    const result = await handleCreateKudos(
      {
        senderIdHeader: 'not-a-uuid',
        body: {
          receiverId: RECEIVER_ID,
          message: 'Thanks!',
          category: 'Thank You',
        },
      },
      dependencies
    );

    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({
      message: 'Invalid x-user-id header.',
    });
    expect(dependencies.createKudos).not.toHaveBeenCalled();
  });

  it('handleCreateKudos validates invalid body', async () => {
    const result = await handleCreateKudos(
      {
        senderIdHeader: SENDER_ID,
        body: {
          receiverId: RECEIVER_ID,
          message: '',
          category: 'Thank You',
        },
      },
      dependencies
    );

    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({
      message: 'Invalid request body.',
    });
    expect(dependencies.createKudos).not.toHaveBeenCalled();
  });

  it('handleCreateKudos validates message max length and category enum', async () => {
    const tooLongMessageResult = await handleCreateKudos(
      {
        senderIdHeader: SENDER_ID,
        body: {
          receiverId: RECEIVER_ID,
          message: 'a'.repeat(501),
          category: 'Thank You',
        },
      },
      dependencies
    );

    const invalidCategoryResult = await handleCreateKudos(
      {
        senderIdHeader: SENDER_ID,
        body: {
          receiverId: RECEIVER_ID,
          message: 'Thanks!',
          category: 'Invalid Category',
        },
      },
      dependencies
    );

    expect(tooLongMessageResult.status).toBe(400);
    expect(tooLongMessageResult.body).toMatchObject({
      message: 'Invalid request body.',
    });
    expect(invalidCategoryResult.status).toBe(400);
    expect(invalidCategoryResult.body).toMatchObject({
      message: 'Invalid request body.',
    });
    expect(dependencies.createKudos).not.toHaveBeenCalled();
  });

  it('handleCreateKudos calls repository and returns created item', async () => {
    const createdAt = new Date().toISOString();
    vi.mocked(dependencies.createKudos).mockResolvedValue({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      senderId: SENDER_ID,
      receiverId: RECEIVER_ID,
      message: 'Great support on the release!',
      category: 'Teamwork',
      createdAt,
    });

    const result = await handleCreateKudos(
      {
        senderIdHeader: SENDER_ID,
        body: {
          receiverId: RECEIVER_ID,
          message: 'Great support on the release!',
          category: 'Teamwork',
        },
      },
      dependencies
    );

    expect(result.status).toBe(201);
    expect(dependencies.createKudos).toHaveBeenCalledWith({
      senderId: SENDER_ID,
      receiverId: RECEIVER_ID,
      message: 'Great support on the release!',
      category: 'Teamwork',
    });
    expect(result.body).toMatchObject({
      senderId: SENDER_ID,
      receiverId: RECEIVER_ID,
      message: 'Great support on the release!',
      category: 'Teamwork',
      createdAt,
    });
  });

  it('handleCreateKudos returns 500 when repository throws', async () => {
    vi.mocked(dependencies.createKudos).mockRejectedValue(new Error('db failure'));

    const result = await handleCreateKudos(
      {
        senderIdHeader: SENDER_ID,
        body: {
          receiverId: RECEIVER_ID,
          message: 'Great support on the release!',
          category: 'Teamwork',
        },
      },
      dependencies
    );

    expect(result.status).toBe(500);
    expect(result.body).toEqual({ message: 'Failed to create kudos.' });
  });

  it('handleListKudos validates query', async () => {
    const result = await handleListKudos(
      {
        query: {
          limit: '0',
          offset: '2',
        },
      },
      dependencies
    );

    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({
      message: 'Invalid query params.',
    });
    expect(dependencies.listKudos).not.toHaveBeenCalled();
  });

  it('handleListKudos validates invalid limit max and negative offset', async () => {
    const limitResult = await handleListKudos(
      {
        query: {
          limit: '101',
          offset: '0',
        },
      },
      dependencies
    );
    const offsetResult = await handleListKudos(
      {
        query: {
          limit: '10',
          offset: '-1',
        },
      },
      dependencies
    );

    expect(limitResult.status).toBe(400);
    expect(limitResult.body).toMatchObject({
      message: 'Invalid query params.',
    });
    expect(offsetResult.status).toBe(400);
    expect(offsetResult.body).toMatchObject({
      message: 'Invalid query params.',
    });
    expect(dependencies.listKudos).not.toHaveBeenCalled();
  });

  it('handleListKudos uses default pagination when query is empty', async () => {
    vi.mocked(dependencies.listKudos).mockResolvedValue([]);

    const result = await handleListKudos(
      {
        query: {},
      },
      dependencies
    );

    expect(result.status).toBe(200);
    expect(dependencies.listKudos).toHaveBeenCalledWith({ limit: 20, offset: 0 });
    expect(result.body).toMatchObject({
      pagination: {
        limit: 20,
        offset: 0,
        count: 0,
      },
      items: [],
    });
  });

  it('handleListKudos returns pagination built from query and repository result', async () => {
    vi.mocked(dependencies.listKudos).mockResolvedValue([
      {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        senderId: SENDER_ID,
        receiverId: RECEIVER_ID,
        message: 'A',
        category: 'Great Job',
        createdAt: new Date().toISOString(),
      },
    ]);

    const result = await handleListKudos(
      {
        query: {
          limit: '1',
          offset: '2',
        },
      },
      dependencies
    );

    expect(result.status).toBe(200);
    expect(dependencies.listKudos).toHaveBeenCalledWith({ limit: 1, offset: 2 });
    expect(result.body).toMatchObject({
      pagination: {
        limit: 1,
        offset: 2,
        count: 1,
      },
      items: [
        {
          id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        },
      ],
    });
  });

  it('handleListKudos returns 500 when repository throws', async () => {
    vi.mocked(dependencies.listKudos).mockRejectedValue(new Error('db failure'));

    const result = await handleListKudos(
      {
        query: {
          limit: '1',
          offset: '2',
        },
      },
      dependencies
    );

    expect(result.status).toBe(500);
    expect(result.body).toEqual({ message: 'Failed to fetch kudos.' });
  });
});
