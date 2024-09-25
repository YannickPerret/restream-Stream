// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'
import StreamSchedule from '#models/stream_schedule'
import { DateTime } from 'luxon'
import Stream from '#models/stream'

export default class StreamSchedulesController {
  async index({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const streamSchedule = await StreamSchedule.query()
      .preload('stream')
      .preload('user')
      .where('user_id', user.id)
    return response.json(streamSchedule)
  }

  async create({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const { streamId, startTime, endTime, recurrenceType, recurrenceEndDate, timezone } =
      request.only([
        'streamId',
        'startTime',
        'endTime',
        'recurrenceType',
        'recurrenceEndDate',
        'timezone',
      ])

    const stream = await Stream.findOrFail(streamId)

    // Convert startTime and endTime to DateTime objects
    let startDateTime = DateTime.fromISO(startTime)
    let endDateTime = DateTime.fromISO(endTime)

    const schedules = []

    if (recurrenceType) {
      // Convert recurrenceEndDate to DateTime
      const recurrenceEndDateTime = DateTime.fromISO(recurrenceEndDate)

      // Loop to create schedules based on the recurrence type
      while (startDateTime <= recurrenceEndDateTime) {
        schedules.push({
          streamId: stream.id,
          startTime: startDateTime,
          endTime: endDateTime,
          timezone: timezone,
          status: 'scheduled',
          userId: user.id,
        })

        // Update startDateTime and endDateTime for next recurrence
        if (recurrenceType === 'daily') {
          startDateTime = startDateTime.plus({ days: 1 })
          endDateTime = endDateTime.plus({ days: 1 })
        } else if (recurrenceType === 'weekly') {
          startDateTime = startDateTime.plus({ weeks: 1 })
          endDateTime = endDateTime.plus({ weeks: 1 })
        } else if (recurrenceType === 'monthly') {
          startDateTime = startDateTime.plus({ months: 1 })
          endDateTime = endDateTime.plus({ months: 1 })
        }
      }
    } else {
      // If no recurrence, create a single schedule
      schedules.push({
        streamId: stream.id,
        startTime: startDateTime,
        endTime: endDateTime,
        timezone: timezone,
        status: 'scheduled',
        userId: user.id,
      })
    }

    // Save all schedules
    await StreamSchedule.createMany(schedules)

    return response.created({ message: 'Schedule(s) created successfully' })
  }
}
