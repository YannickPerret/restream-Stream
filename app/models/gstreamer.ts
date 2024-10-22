import logger from '@adonisjs/core/services/logger'
import encryption from '@adonisjs/core/services/encryption'
import {spawn} from 'node:child_process'
import app from "@adonisjs/core/services/app";
import redis from "@adonisjs/redis/services/main";

const RESTART_DELAY_MS = 10000;

const BASE_URLS: Record<string, string> = {
  twitch: 'rtmp://live.twitch.tv/app',
  youtube: 'rtmp://a.rtmp.youtube.com/live2',
}

export default class GStreamerStream {
  private instance: any
  private analyticsInterval: NodeJS.Timeout | null = null
  private timeTrackingInterval: NodeJS.Timeout | null = null;
  private elapsedTime: number = 0;
  private isStopping: boolean = false;

  constructor(
    private streamId: string,
    private channels: { type: string; streamKey: string }[],
    private timelinePath: string,
    private logo: string,
    private overlay: string,
    private enableBrowser: boolean,
    private webpageUrl: string,
    private bitrate: string,
    private resolution: string,
    private fps: number,
    private loop: boolean,
    private showWatermark: boolean,
  ) {}

  async startStream() {
    console.log('Starting stream with GStreamer...');
    const inputParameters = this.buildGStreamerPipeline();

    this.startTimeTracking();
    this.isStopping = false;

    this.instance = spawn('gst-launch-1.0', inputParameters, {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.instance.stdout.on('data', (data) => {
      console.log(`GStreamer stdout: ${data}`);
    });

    this.instance.stderr.on('data', (data) => {
      logger.info(data.toString());
    });

    this.instance.on('exit', async (code) => {
      if (code !== 0 && !this.isStopping) {
        console.log(`Stream exited unexpectedly. Attempting to restart in ${RESTART_DELAY_MS / 1000} seconds...`);
        setTimeout(async () => {
          await this.startStream();
        }, RESTART_DELAY_MS);
      }
    });

    const pid = this.instance.pid;
    console.log(`Stream ${this.streamId} started with PID ${pid}`);
    await redis.set(`stream:${this.streamId}:pid`, pid);
  }

  private buildGStreamerPipeline(): string[] {
    let pipeline = [];
    const videoSource = this.buildVideoSource();
    const browserOverlay = this.enableBrowser ? this.buildBrowserOverlay() : '';
    const watermarkOverlay = this.showWatermark ? this.buildWatermarkOverlay() : '';
    const output = this.buildOutput();

    pipeline.push(videoSource);
    if (browserOverlay) {
      pipeline.push(browserOverlay);
    }
    if (watermarkOverlay) {
      pipeline.push(watermarkOverlay);
    }
    pipeline.push(output);

    return pipeline.flat();
  }

  private buildVideoSource(): string[] {
    return [
      `souphttpsrc location=${this.timelinePath} is-live=true`, // timelinePath devient l'URL de la playlist M3U8
      '!', 'hlsdemux',
      '!', 'decodebin',
      '!', `videorate max-rate=${this.fps}`,
      '!', `video/x-raw,framerate=${this.fps}/1`,
      '!', `videoscale`,
      '!', `video/x-raw,width=${this.resolution.split('x')[0]},height=${this.resolution.split('x')[1]}`,
    ];
  }


  private buildBrowserOverlay(): string[] {
    return [
      `wpewebkit url=${this.webpageUrl}`,
      '!', 'video/x-raw,width=640,height=480',
      '!', 'videoconvert',
      '!', 'alpha method=0x000000',  // Set transparency if needed
      '!', 'compositor',
      'name=comp sink_0::xpos=0 sink_0::ypos=0',
      'sink_1::xpos=(main_w-overlay_w)/2 sink_1::ypos=(main_h-overlay_h)/2',
    ];
  }

  private buildWatermarkOverlay(): string[] {
    const watermarkPath = app.publicPath('watermark/watermark.png');
    return [
      `filesrc location=${watermarkPath}`,
      '!', 'decodebin',
      '!', 'videoconvert',
      '!', 'imagefreeze',
      '!', 'videoconvert',
      '!', 'compositor name=comp',
      'sink_1::xpos=(main_w-overlay_w)/2',
      'sink_1::ypos=10',
    ];
  }

  private buildOutput(): string[] {
    const output = [];
    if (this.channels.length === 1) {
      const channel = this.channels[0];
      const baseUrl = BASE_URLS[channel.type];
      const outputUrl = `${baseUrl}/${encryption.decrypt(channel.streamKey)}`;
      output.push(
        '!', `x264enc bitrate=${this.bitrate}`,
        '!', 'flvmux',
        '!', `rtmpsink location="${outputUrl}"`,
      );
    } else {
      const tee = this.channels
        .map((channel) => {
          const baseUrl = BASE_URLS[channel.type];
          const outputUrl = `${baseUrl}/${encryption.decrypt(channel.streamKey)}`;
          return `[f=flv]${outputUrl}`;
        })
        .join('|');
      output.push(
        '!', `x264enc bitrate=${this.bitrate}`,
        '!', 'tee',
        `! queue ! mux. mux=flvmux`,
        '!', `tee name=t t. ! rtmpsink location="${tee}"`,
      );
    }
    return output;
  }

  private startTimeTracking() {
    this.elapsedTime = 0;
    this.timeTrackingInterval = setInterval(async () => {
      this.elapsedTime += 10;
      await redis.set(`stream:${this.streamId}:elapsed_time`, this.elapsedTime.toString());
    }, 10000);
  }

  stopStream = async (pid: number) => {
    this.isStopping = true;
    if (this.instance) {
      process.kill(pid, 'SIGKILL');
    }
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
    }
    if (this.timeTrackingInterval) {
      clearInterval(this.timeTrackingInterval);
    }
    await redis.del(`stream:${this.streamId}:elapsed_time`);
  }
}
