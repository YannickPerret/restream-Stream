import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
import Stream from '#models/stream'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import cron from 'node-cron'

export default class StreamSchedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare streamId: number

  @column()
  declare userId: number

  @column.dateTime()
  declare startTime: DateTime

  @column.dateTime()
  declare endTime: DateTime

  @column()
  declare timezone: string

  @column()
  declare status: 'scheduled' | 'running' | 'completed' | 'canceled'

  @column()
  declare recurrenceType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'null'

  @column.dateTime()
  declare recurrenceEndTime: DateTime | null

  @belongsTo(() => Stream)
  declare stream: BelongsTo<typeof Stream>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static async validateDates(schedule: StreamSchedule) {
    const now = DateTime.now()

    // Validate that startTime is in the future
    if (schedule.startTime <= now) {
      return false
    }

    // Validate that endTime is after startTime
    if (schedule.endTime <= schedule.startTime) {
      return false
    }
    return true
  }

  @afterCreate()
  static async runScheduler(schedule: StreamSchedule) {
    try {
      // Charger le stream associé
      await schedule.load('stream')

      if (!schedule.stream) {
        console.error(`Stream avec l'ID ${schedule.streamId} non trouvé`)
        return
      }

      const stream = schedule.stream

      if (schedule.status !== 'scheduled') {
        console.log(
          `Le statut de la tâche pour le stream ${schedule.streamId} n'est pas 'scheduled', annulation du démarrage.`
        )
        return
      }
      // Générer l'expression cron pour le démarrage
      const startCronExpression = schedule.toCronForOneTimeExecution(schedule.startTime)

      if (!startCronExpression) {
        console.error("Impossible de générer l'expression cron pour le démarrage.")
        return
      }

      // Planifier le démarrage du stream
      cron.schedule(
        startCronExpression,
        async () => {
          // Vérifier que la date et l'heure correspondent exactement
          const now = DateTime.now().setZone(schedule.timezone || 'UTC')
          if (now.hasSame(schedule.startTime, 'minute')) {
            await stream.run()
            schedule.status = 'running'
            await schedule.save()
          }
        },
        {
          timezone: schedule.timezone || 'UTC',
        }
      )

      console.log(`Stream planifié pour démarrer avec l'expression cron ${startCronExpression}`)

      // Planifier l'arrêt si endTime est défini
      if (schedule.endTime) {
        const endCronExpression = schedule.toCronForOneTimeExecution(schedule.endTime)
        if (!endCronExpression) {
          console.error("Impossible de générer l'expression cron pour l'arrêt.")
          return
        }

        const stopTask = cron.schedule(
          endCronExpression,
          async () => {
            const now = DateTime.now().setZone(schedule.timezone || 'UTC')
            if (now.hasSame(schedule.endTime, 'minute')) {
              await stream.stop()
              // Arrêter la tâche après exécution
              stopTask.stop()
              schedule.status = 'completed'
              await schedule.save()
            }
          },
          {
            timezone: schedule.timezone || 'UTC',
          }
        )

        console.log(`Stream planifié pour s'arrêter avec l'expression cron ${endCronExpression}`)
      }
    } catch (error) {
      console.error('Erreur lors de la planification du stream:', error)
    }
  }

  // Générer une expression cron pour une exécution unique
  toCronForOneTimeExecution(time: DateTime) {
    if (!time) return null

    const minute = time.minute
    const hour = time.hour
    const day = time.day
    const month = time.month

    // L'expression cron : "minute heure jour mois *"
    return `${minute} ${hour} ${day} ${month} *`
  }

  toCronSchedule() {
    if (!this.startTime) return null

    const minute = this.startTime.minute
    const hour = this.startTime.hour
    const day = this.startTime.day
    const month = this.startTime.month
    const dayOfWeek = this.startTime.weekday % 7

    switch (this.recurrenceType) {
      case 'daily':
        return `${minute} ${hour} * * *`
      case 'weekly':
        return `${minute} ${hour} * * ${dayOfWeek}`
      case 'monthly':
        return `${minute} ${hour} ${day} * *`
      case 'yearly':
        return `${minute} ${hour} ${day} ${month} *`
      default:
        return null
    }
  }

  toCronScheduleEnd() {
    if (!this.endTime) return null

    const minute = this.endTime.minute
    const hour = this.endTime.hour
    const day = this.endTime.day
    const month = this.endTime.month
    const dayOfWeek = this.endTime.weekday % 7 // Ajustement pour node-cron

    switch (this.recurrenceType) {
      case 'daily':
        return `${minute} ${hour} * * *`
      case 'weekly':
        return `${minute} ${hour} * * ${dayOfWeek}`
      case 'monthly':
        return `${minute} ${hour} ${day} * *`
      case 'yearly':
        return `${minute} ${hour} ${day} ${month} *`
      default:
        return null
    }
  }
}
