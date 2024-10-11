import type { ApplicationService } from '@adonisjs/core/types'
import FFMPEGStream from '#models/ffmpeg'
import redis from "@adonisjs/redis/services/main";

export default class StreamProvider {
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

      const pid = stream.startStream();
      // Stocker le PID dans Redis pour ce stream spécifique
      await redis.set(`stream:${streamData.id}:pid`, pid);

      console.log(`Stream started with PID: ${pid}`);
    });

    // Écouter le canal pour arrêter un stream spécifique
    redis.psubscribe('stream:*:stop', async (pattern, message) => {
      const { pid } = JSON.parse(message);

      if (pid) {
        try {
          process.kill(pid, 'SIGKILL');
          console.log(`Stream with PID ${pid} successfully stopped.`);
        } catch (error) {
          if (error.code === 'ESRCH') {
            console.error(`No process found with PID ${pid}.`);
          } else {
            console.error(`Error stopping process with PID ${pid}: ${error.message}`);
          }
        }
      }
    });
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
