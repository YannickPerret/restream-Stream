import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserFactory } from '#database/factories/user_factory'
import Users from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // make seeder for users with lucid
    const users: Users[] = await UserFactory.createMany(20)

    const adminUser = await Users.create({
      username: 'admin',
      lastName: 'Admin',
      firstName: 'Admin',
      phone: '1234567890',
      email: 'admin@coffeestream.com',
      password: 'admin',
      isVerified: true,
    })

    const devUser = await Users.create({
      username: 'tchoune',
      lastName: 'Perret',
      firstName: 'Yannick',
      phone: '0123456789',
      email: 'dev@coffeestream.com',
      password: '12345678',
      isVerified: true,
    })
    users.push(adminUser)
    users.push(devUser)
  }
}
