import { Job } from '@rlanz/bull-queue'
import StreamSchedule from '#models/stream_schedule'

interface StopStreamJobPayload {
  scheduleId: number
}

export default class StopStreamJob extends Job {
  // This is the path to the file that is used to create the job
  static get $$filepath() {
    return import.meta.url
  }

  /**
   * Base Entry point
   */
  async handle(payload: StopStreamJobPayload) {
    const { scheduleId } = payload
    const schedule = await StreamSchedule.find(scheduleId)
    if (schedule) {
      await schedule.load('stream')
      await schedule.stream.stop()
      schedule.status = 'completed'
      await schedule.save()
      console.log(`Stream ${schedule.stream.name} stopped at ${schedule.endTime}`)
    } else {
      console.error(`Schedule with ID ${scheduleId} not found`)
    }
  }

  /**
   * This is an optional method that gets called when the retries has exceeded and is marked failed.
   */
  async rescue(payload: StopStreamJobPayload) {}
}
