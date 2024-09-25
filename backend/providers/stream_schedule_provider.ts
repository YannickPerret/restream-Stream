import type { ApplicationService } from '@adonisjs/core/types'
import StreamSchedule from '#models/stream_schedule'

export default class StreamScheduleProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {
    try {
      const scheduleStreams = await StreamSchedule.query()
        .preload('stream')
        .where('status', 'scheduled')

      if (scheduleStreams.length > 0) {
        for (const scheduleStream of scheduleStreams) {
          try {
            if (await StreamSchedule.validateDates(scheduleStream)) {
              console.log(
                `Scheduling stream ${scheduleStream.stream.name} (Schedule ID: ${scheduleStream.id})`
              )
              await StreamSchedule.runScheduler(scheduleStream)
            }
          } catch (error) {
            console.error(
              `Error validating or scheduling stream with ID ${scheduleStream.id}:`,
              error
            )
          }
        }
      } else {
        console.log('No scheduled streams found.')
      }
    } catch (error) {
      console.error('Error loading scheduled streams:', error)
    }
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
