import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { DateTime } from 'luxon'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      username: faker.internet.userName(),
      lastName: faker.person.lastName(),
      firstName: faker.person.firstName(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
  })
  .build()
