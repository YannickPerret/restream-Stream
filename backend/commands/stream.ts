import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Stream from '#models/stream'

export default class StreamCommand extends BaseCommand {
  static commandName = 'stream:start'
  static description = 'Make a stream with default settings'

  static options: CommandOptions = {
    startApp: false,
  }

  async run() {
    this.logger.info('Hello world from "Stream"')
    const stream = new Stream()
    await stream.startStream('')
  }
}
