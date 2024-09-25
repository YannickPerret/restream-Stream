// tests/functional/stream.spec.ts

import { test } from '@japa/runner'
import User from '#models/user'
import Stream from '#models/stream'
import Timeline from '#models/timeline'
import Provider from '#models/providers/provider'
import Subscription from '#models/subscription'
import Feature from '#models/feature'
import Database from '@adonisjs/lucid/database'
import Drive from '@adonisjs/core/services/drive'
import StreamManager from '#models/stream_manager'

test.group('StreamsController', (group) => {
  let user: User
  let timeline: Timeline
  let provider: Provider

  group.setup(async () => {
    await Database.beginGlobalTransaction()

    // Créer un utilisateur authentifié
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'secret',
    })

    // Créer une timeline
    timeline = await Timeline.create({
      title: 'Test Timeline',
    })

    // Créer un provider
    provider = await Provider.create({
      name: 'Test Provider',
      baseUrl: 'rtmp://test.provider.com/live',
      streamKey: 'test_stream_key',
    })

    // Créer une souscription active avec les features nécessaires
    const subscription = await Subscription.create({
      userId: user.id,
      status: 'active',
      // autres champs si nécessaire
    })

    // Ajouter des features à la souscription
    await Feature.createMany([
      {
        subscriptionId: subscription.id,
        name: 'max_stream_instances',
        values: ['5'],
      },
      {
        subscriptionId: subscription.id,
        name: 'quality',
        values: ['720p', '1080p'],
      },
    ])
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test("Création d'un stream", async ({ client, assert }) => {
    const response = await client
      .post('/streams')
      .loginAs(user)
      .field('title', 'Test Stream')
      .field('timeline', timeline.id)
      .field('provider', provider.id)
      .field('quality', '1080p')
      .field('runLive', 'false')
      .field('websiteUrl', '')

    response.assertStatus(201)
    response.assertBodyContains({
      name: 'Test Stream',
    })

    const stream = await Stream.find(response.body().id)
    assert.isNotNull(stream)
    assert.equal(stream?.name, 'Test Stream')
  })

  test("Mise à jour d'un stream", async ({ client, assert }) => {
    const stream = await Stream.create({
      name: 'Old Stream',
      pid: 0,
      status: 'inactive',
      userId: user.id,
      type: 'ffmpeg',
      timelineId: timeline.id,
      providerId: provider.id,
    })

    const response = await client.put(`/streams/${stream.id}`).loginAs(user).form({
      name: 'Updated Stream',
      timeline: timeline.id,
      restartTimes: 20000,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      name: 'Updated Stream',
    })

    await stream.refresh()
    assert.equal(stream.name, 'Updated Stream')
    assert.equal(stream.restartTimes, 20000)
  })

  test("Démarrage d'un stream", async ({ client, assert }) => {
    const stream = await Stream.create({
      name: 'Stream to Start',
      pid: 0,
      status: 'inactive',
      userId: user.id,
      type: 'ffmpeg',
      timelineId: timeline.id,
      providerId: provider.id,
    })

    // Mock du StreamManager et de ses méthodes
    const streamManagerMock = {
      getOrAddStream: async () => ({
        run: async () => {},
      }),
    }

    // Remplacer le StreamManager par le mock
    StreamManager.getOrAddStream = streamManagerMock.getOrAddStream

    const response = await client.post(`/streams/${stream.id}/start`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Stream started',
    })

    await stream.refresh()
    assert.equal(stream.status, 'active')
  })

  test("Arrêt d'un stream", async ({ client, assert }) => {
    const stream = await Stream.create({
      name: 'Stream to Stop',
      pid: 12345,
      status: 'active',
      userId: user.id,
      type: 'ffmpeg',
      timelineId: timeline.id,
      providerId: provider.id,
    })

    // Mock du StreamManager et de ses méthodes
    const streamManagerMock = {
      getOrAddStream: async () => ({
        stop: async () => {},
      }),
      removeStream: async () => {},
    }

    // Remplacer le StreamManager par le mock
    StreamManager.getOrAddStream = streamManagerMock.getOrAddStream
    StreamManager.removeStream = streamManagerMock.removeStream

    const response = await client.post(`/streams/${stream.id}/stop`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Stream stopped',
    })

    await stream.refresh()
    assert.equal(stream.status, 'inactive')
  })

  test("Suppression d'un stream", async ({ client, assert }) => {
    const stream = await Stream.create({
      name: 'Stream to Delete',
      pid: 0,
      status: 'inactive',
      userId: user.id,
      type: 'ffmpeg',
      timelineId: timeline.id,
      providerId: provider.id,
    })

    // Mock du Drive pour éviter la suppression réelle des fichiers
    Drive.fake()

    const response = await client.delete(`/streams/${stream.id}`).loginAs(user)

    response.assertStatus(204)

    const deletedStream = await Stream.find(stream.id)
    assert.isNull(deletedStream)

    // Restaurer le comportement normal du Drive
    Drive.restore()
  })
})
