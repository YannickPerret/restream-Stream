import { test } from '@japa/runner'
import Stream from '#models/stream'
import User from '#models/user'
import Timeline from '#models/timeline'
import Provider from '#models/provider'
import Video from '#models/video'
import app from '@adonisjs/core/services/app'
import path from 'node:path'
import * as fs from 'node:fs'
import { execSync } from 'node:child_process'

test.group('Stream create and start', (group) => {
  let user: User
  let stream: Stream
  let timeline: Timeline
  let video1: Video
  let video2: Video
  let provider: Provider
  const logoPath = 'tests/assets/logo/logo.png'
  const overlayPath = 'tests/assets/overlay/overlay.png'
  const finalLogoPath = path.join(app.publicPath(), 'assets/streams/logo', 'logo.png')
  const finalOverlayPath = path.join(app.publicPath(), 'assets/streams/overlay', 'overlay.png')

  group.setup(async () => {
    user = await User.firstOrCreate({
      email: 'testuser@example.com',
      password: 'password123',
      fullName: 'test user',
    })

    video1 = await Video.create({
      title: 'Test Video 1',
      description: 'This is the first test video',
      path: '/Users/tchoune/Documents/dev/js/coffeeStream/backend/tests/assets/videos/testVideo.mp4',
      status: 'published',
      showInLive: 1,
      userId: user.id,
    })

    video2 = await Video.create({
      title: 'Test Video 2',
      description: 'This is the second test video',
      path: '/Users/tchoune/Documents/dev/js/coffeeStream/backend/tests/assets/videos/testVideo.mp4',
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

    // Create directories if they don't exist
    fs.mkdirSync(path.dirname(finalLogoPath), { recursive: true })
    fs.mkdirSync(path.dirname(finalOverlayPath), { recursive: true })

    // Copy files to the final destinations
    fs.copyFileSync(logoPath, finalLogoPath)
    fs.copyFileSync(overlayPath, finalOverlayPath)

    stream = await Stream.create({
      name: 'Test Stream',
      restartTimes: 1777700,
      type: 'ffmpeg',
      userId: user.id,
      timelineId: timeline.id,
      logo: finalLogoPath,
      overlay: finalOverlayPath,
    })

    await stream.related('providers').attach({
      [provider.id]: {
        on_primary: true,
      },
    })
  })

  group.teardown(async () => {
    if (stream) {
      await stream.stop()
      await stream.delete()
    }
    if (timeline) await timeline.delete()
    if (video1) await video1.delete()
    if (video2) await video2.delete()
    if (provider) await provider.delete()
    if (user) await user.delete()

    // Ensure dummy files are removed
    if (fs.existsSync(finalLogoPath)) {
      fs.unlinkSync(finalLogoPath)
    }

    if (fs.existsSync(finalOverlayPath)) {
      fs.unlinkSync(finalOverlayPath)
    }
  })

  test('create and start a new stream', async ({ assert }) => {
    // Load the timeline and providers
    await stream.load('timeline')
    await stream.load('providers')

    // Verify the stream exists before starting
    let streamExists = await Stream.find(stream.id)
    assert.exists(streamExists, 'Stream should exist before starting')

    // Start the stream
    await stream.run()

    // Verify the stream status is active after starting
    streamExists = await Stream.find(stream.id)
    assert.exists(streamExists, 'Stream should exist after starting')
    assert.equal(streamExists!.status, 'active', 'Stream should be active after starting')

    // Verify that the ffmpeg process is running with the correct PID
    const pid = streamExists!.pid
    assert.isTrue(pid > 0, 'FFmpeg process should have a valid PID')

    try {
      const output = execSync(`ps -p ${pid}`).toString()
      assert.include(output, `ffmpeg`, 'FFmpeg process should be running')
    } catch (error) {
      assert.fail(`FFmpeg process with PID ${pid} is not running`)
    }
  })
})
