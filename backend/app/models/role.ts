import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import {role} from '#enums/role'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
