import type { ApplicationService } from '@adonisjs/core/types'
import FFMPEGStream from '#models/ffmpeg'
import redis from "@adonisjs/redis/services/main";

export default class StreamProvider {
  private streams: Map<string, FFMPEGStream> = new Map(); // Stocker les instances de streams

  constructor(protected app: ApplicationService) {

  }

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
    redis.psubscribe('stream:*:start', async (pattern, message) => {
      const streamData = JSON.parse(message);

      const stream = new FFMPEGStream(
        streamData.channels,
        streamData.timelinePath,
        streamData.logo,
        streamData.overlay,
        streamData.guestFile,
        streamData.enableBrowser,
        streamData.webpageUrl,
        streamData.bitrate,
        streamData.resolution,
        streamData.fps
      );

      const pid = await stream.startStream();
      this.streams.set(streamData.id, stream);

      await redis.set(`stream:${streamData.id}:pid`, pid);
      await stream.sendAnalytics(streamData.id, pid);
    });

    redis.psubscribe('stream:*:stop', async (pattern, message) => {
      const { id } = JSON.parse(message);
      const pid = await redis.get(`stream:${id}:pid`);

      if (pid) {
        const stream = this.streams.get(id);
        if (stream) {
          try {
            await stream.stopStream(parseInt(pid));
            this.streams.delete(id);

            console.log(`Stream with PID ${pid} successfully stopped.`);
          } catch (error) {
            if (error.code === 'ESRCH') {
              console.error(`No process found with PID ${pid}.`);
            } else {
              console.error(`Error stopping process with PID ${pid}: ${error.message}`);
            }
          }
        } else {
          console.error(`No active stream found for ID ${id}.`);
        }
      } else {
        console.error(`No PID found for stream ID ${id}.`);
      }
    });
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
