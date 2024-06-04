import { test } from '@japa/runner'
import User from '#models/user'
import Guest from '#models/guest'
import Video from '#models/video'
import GuestToken from '#models/guest_token'
import app from '@adonisjs/core/services/app'
import path from 'node:path'
import * as fs from 'node:fs'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'

test.group('Video upload', (group) => {
  let user: User
  let guest: Guest
  let video: Video
  const videoPath = 'tests/assets/videos/testVideo.mp4'
  const finalVideoPath = path.join(app.makePath(), 'uploads/videos/testVideo.mp4')

  group.setup(async () => {
    user = await User.firstOrCreate({
      email: 'testuser@example.com',
      password: 'password123',
      fullName: 'Test User',
    })

    guest = await Guest.create({
      email: 'guest@example.com',
      displayName: 'Test Guest',
      discordUsername: 'testguest#1234',
      steamUsername: 'testguest',
      twitchUsername: 'testguest',
      twitterUsername: 'testguest',
      youtubeUsername: 'testguest',
      telegramUsername: 'testguest',
      canDiffuse: 1,
      notes: 'This is a test guest',
    })

    // Create directories if they don't exist
    fs.mkdirSync(path.dirname(finalVideoPath), { recursive: true })

    // Copy test video to the final destination
    fs.copyFileSync(videoPath, finalVideoPath)
  })

  group.teardown(async () => {
    //if (video) await video.delete()
    if (guest) await guest.delete()
    if (user) await user.delete()
  })

  test('upload a video and send email', async ({ assert, mailer }) => {
    const token = 'test-token'
    const expiresAt = DateTime.now().plus({ minutes: 15 })

    video = await Video.create({
      title: 'Test Video',
      description: 'This is a test video upload',
      path: finalVideoPath,
      showInLive: 1,
      status: 'unpublished',
      guestId: guest.id,
    })

    await GuestToken.create({
      guestId: guest.id,
      videoId: video.id,
      token,
      expiresAt,
      status: 'sended',
    })

    // Mock the email sending
    const email = mailer.fake()

    await mail.send((message) => {
      message
        .to(guest.email)
        .from('noreply@beyondspeedrun.com')
        .subject('Video Upload Verification')
        .htmlView('emails/verify_guest', {
          guest,
          token,
          FRONTEND_URL: process.env.FRONTEND_URL,
        })
    })

    // Ensure the email was sent correctly
    assert.equal(email.recent().length, 1, 'Should have sent one email')
    const recentEmail = email.recent()[0]

    assert.equal(recentEmail.to![0].address, 'guest@example.com')
    assert.equal(recentEmail.from![0].address, 'noreply@beyondspeedrun.com')
    assert.equal(recentEmail.subject, 'Video Upload Verification')

    assert.include(recentEmail.html, 'Verify Video')
    assert.include(recentEmail.html, `token=${token}`)

    mailer.restore()

    // Ensure the video exists
    const fetchedVideo = await Video.findByOrFail('title', 'Test Video')
    assert.exists(fetchedVideo)
    assert.equal(fetchedVideo.title, 'Test Video')
    assert.equal(fetchedVideo.status, 'unpublished')
  })
})
