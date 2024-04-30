import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { DateTime } from 'luxon'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      fullName: faker.internet.displayName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      lastLoginAt: DateTime.now(),
    }
  })
  .build()
