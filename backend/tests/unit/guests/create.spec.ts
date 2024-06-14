import { test } from '@japa/runner'
import Guest from '#models/guest'
import User from '#models/user'

test.group('Guest create', (group) => {
  let user: User
  let guest: Guest

  group.setup(async () => {
    user = await User.firstOrCreate({
      email: 'testuser@example.com',
      password: 'password123',
      fullName: 'Test User',
    })
  })

  group.teardown(async () => {
    if (guest) await guest.delete()
    if (user) await user.delete()
  })

  test('create a new guest', async ({ assert }) => {
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

    const fetchedGuest = await Guest.findByOrFail('email', 'guest@example.com')
    assert.exists(fetchedGuest)
    assert.equal(fetchedGuest.email, 'guest@example.com')
    assert.equal(fetchedGuest.displayName, 'Test Guest')
    assert.equal(fetchedGuest.discordUsername, 'testguest#1234')
    assert.equal(fetchedGuest.steamUsername, 'testguest')
    assert.equal(fetchedGuest.twitchUsername, 'testguest')
    assert.equal(fetchedGuest.twitterUsername, 'testguest')
    assert.equal(fetchedGuest.youtubeUsername, 'testguest')
    assert.equal(fetchedGuest.telegramUsername, 'testguest')
    assert.equal(fetchedGuest.canDiffuse, 1)
    assert.equal(fetchedGuest.notes, 'This is a test guest')
  })
})
