import { Job } from '@rlanz/bull-queue'
import StreamSchedule from '#models/stream_schedule'

interface StartStreamJobPayload {
  scheduleId: number
}

export default class StartStreamJob extends Job {
  // This is the path to the file that is used to create the job
  static get $$filepath() {
    return import.meta.url
  }

  /**
   * Base Entry point
   */
  async handle(payload: StartStreamJobPayload) {
    try {
      const { scheduleId } = payload
      const schedule = await StreamSchedule.find(scheduleId)

      console.log('iddd', scheduleId)
      if (!schedule) {
        console.error(`Schedule with ID ${scheduleId} not found`)
        return
      }

      await schedule.load('stream')

      if (!schedule.stream) {
        console.error(`Stream associated with schedule ID ${scheduleId} not found`)
        return
      }

      await schedule.stream.start()
      schedule.status = 'running'
      await schedule.save()
      console.log(`Stream ${schedule.stream.name} started at ${schedule.startTime}`)
    } catch (error) {
      console.error(`Error in StartStreamJob:`, error)
      throw error // Rethrow the error to trigger retry mechanisms if configured
    }
  }

  /**
   * This is an optional method that gets called when the retries has exceeded and is marked failed.
   */
  async rescue(payload: StartStreamJobPayload) {
    const { scheduleId } = payload
    const schedule = await StreamSchedule.find(scheduleId)

    if (schedule) {
      schedule.status = 'canceled'
      await schedule.save()
      console.error(`StartStreamJob for schedule ID ${scheduleId} has failed after retries.`)
      // Vous pouvez également envoyer une notification ou un email ici
    }
  }
}
