import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Stream from '#models/stream'
import { DateTime } from 'luxon'

export default class StreamStop extends BaseCommand {
  static commandName = 'stream:stop'
  static description = 'Stop the first active stream'

  static options: CommandOptions = {}

  async run() {
    this.logger.info('Hello world from "StreamStop"')
    const stream = await Stream.query().where('status', 'active').first()
    if (!stream) {
      this.logger.info('No active streams found')
      return
    }
    stream.instance.kill()
    stream.endTime = DateTime.now()
    await stream.save()
  }
}
