import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserFactory } from '#database/factories/user_factory'
import Role from '#models/role'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {

    const userRole = await Role.findByOrFail('name', 'user')
    const adminRole = await Role.findByOrFail('name', 'admin')

    // Seed users
    const users = await UserFactory.createMany(20)

    // Assign the user role to all other users
    for (const user of users) {
      user.roleId = userRole.id
      await user.save()
    }

    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@coffeestream.com',
      password: '12345678',
      isVerified: true,
      roleId: adminRole.id, // Assign admin role to this user
    })

    // Create developer user with user role
    await User.create({
      username: 'tchoune',
      email: 'dev@coffeestream.com',
      password: '12345678',
      isVerified: true,
      roleId: userRole.id, // Assign user role to this user
    })
  }
}
