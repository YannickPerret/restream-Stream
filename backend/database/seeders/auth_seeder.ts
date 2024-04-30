import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserFactory } from '#database/factories/user_factory'
import Users from '#models/user'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // make seeder for users with lucid
    const users: Users[] = await UserFactory.createMany(20)

    const adminUser = await Users.create({
      fullName: 'Admin',
      email: 'admin@coffeestream.ch',
      password: 'admin',
      lastLoginAt: DateTime.now(),
    })

    const devUser = await Users.create({
      fullName: 'Yannick Perret',
      email: 'dev@coffeestream.ch',
      password: '12345678',
      lastLoginAt: DateTime.now(),
    })
    users.push(adminUser)
    users.push(devUser)
  }
}
