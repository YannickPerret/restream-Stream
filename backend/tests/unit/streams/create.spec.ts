import { test } from '@japa/runner'
import Stream from '#models/stream'
import User from '#models/user'
import Timeline from '#models/timeline'
import Provider from '#models/provider'
import Video from '#models/video'
import app from '@adonisjs/core/services/app'

test.group('Stream', (group) => {
  let user: User
  let stream: Stream
  let timeline: Timeline
  let video1: Video
  let video2: Video
  let provider: Provider

  group.setup(async () => {
    user = await User.firstOrCreate({
      email: 'testuser@example.com',
      password: 'password123',
      fullName: 'test user',
    })

    video1 = await Video.create({
      title: 'Test Video 1',
      description: 'This is the first test video',
      path: app.makePath('tests/assets/videos/testVideo.mp4'),
      status: 'published',
      showInLive: 1,
      userId: user.id,
    })

    video2 = await Video.create({
      title: 'Test Video 2',
      description: 'This is the second test video',
      path: app.makePath('tests/assets/videos/testVideo.mp4'),
      status: 'published',
      showInLive: 1,
      userId: user.id,
    })

    timeline = await Timeline.create({
      title: 'Test Timeline',
      description: 'This is a test timeline',
      filePath: '',
      isPublished: true,
      userId: user.id,
    })

    await timeline.related('items').createMany([
      { itemId: video1.id, type: 'video', order: 1 },
      { itemId: video2.id, type: 'video', order: 2 },
    ])

    await timeline.generatePlaylistFile()

    provider = await Provider.create({
      name: 'Test Provider',
      streamKey: process.env.STREAMKEY,
      type: 'Twitch',
      authBearer: process.env.AUTH_BEARER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: process.env.ACCESS_TOKEN,
      broadcasterId: process.env.BROADCASTER_ID,
      userId: user.id,
    })
  })

  group.teardown(async () => {
    if (stream) await stream.delete()
    if (timeline) await timeline.delete()
    if (video1) await video1.delete()
    if (video2) await video2.delete()
    if (provider) await provider.delete()
    if (user) await user.delete()
  })

  test('create a new stream with timeline and provider', async ({ assert }) => {
    // Create the stream
    stream = await Stream.create({
      name: 'Test Stream',
      restartTimes: 1777700,
      type: 'ffmpeg',
      userId: user.id,
      timelineId: timeline.id,
      logo: null,
      status: 'inactive',
    })

    await stream.related('providers').attach({
      [provider.id]: {
        on_primary: true,
      },
    })

    assert.exists(stream.id)
    assert.equal(stream.name, 'Test Stream')
    assert.equal(stream.status, 'inactive')

    await stream.load('providers')
    await stream.load('timeline')

    assert.equal(stream.timelineId, timeline.id)
    assert.equal(stream.timeline.title, 'Test Timeline')

    const primaryProvider = await stream.getPrimaryProvider()
    assert.exists(primaryProvider)
    assert.equal(primaryProvider!.id, provider.id)
  })
})
