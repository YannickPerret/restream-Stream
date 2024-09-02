import { spawn } from 'node:child_process';
import logger from '@adonisjs/core/services/logger';
import encryption from '@adonisjs/core/services/encryption';
import app from '@adonisjs/core/services/app'

export interface StreamProvider {
  startStream(): number;
  stopStream(pid: number): void;
}

export default class Gstreamer implements StreamProvider {
  private instance: any = null;

  constructor(
    private baseUrl: string,
    private streamKey: string,
    private playlistPath: string,
    private enableBrowser: boolean
  ) {}

  startStream(): number {
    const absolutePlaylistPath = app.publicPath(this.playlistPath);
    const streamUrl = `${this.baseUrl}/${encryption.decrypt(this.streamKey)}`;
    const overlayUrl = `https://google.com`;

    console.log('absolutePlaylistPath', absolutePlaylistPath);
    console.log('streamUrl', streamUrl);
    console.log('overlayUrl', overlayUrl);

    const parameters = [
      'uriplaylistbin', `uri=file://${absolutePlaylistPath}`,
      '!', 'decodebin',
      '!', 'videoconvert',
      '!', 'mix.',
      'gstcefsrc', `url=${overlayUrl}`,
      '!', 'video/x-raw,width=1920,height=1080,framerate=60/1',
      '!', 'cefdemux', 'name=d',
      'd.video', '!', 'queue', 'max-size-bytes=0', 'max-size-buffers=0', 'max-size-time=3000000000',
      '!', 'videoconvert',
      '!', 'alpha', 'method=custom', 'alpha=0.5',
      '!', 'mix.',
      'videomixer', 'name=mix',
      '!', 'x264enc', 'bitrate=2000',
      '!', 'h264parse',
      '!', 'flvmux', 'name=mux',
      '!', `rtmpsink location=${streamUrl}`,
      'audioconvert',
      '!', 'audioresample',
      '!', 'voaacenc', 'bitrate=128000',
      '!', 'mux.',
      'd.audio', '!', 'queue', 'max-size-bytes=0', 'max-size-buffers=0', 'max-size-time=3000000000',
      '!', 'audioconvert',
      '!', 'audiomixer', 'name=audiomix',
      '!', 'mux.'
    ];

    this.instance = spawn('gst-launch-1.0', parameters, {
      detached: true,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.handleProcessOutputs(this.instance)

    return Number.parseInt(this.instance.pid.toString(), 10);
  }

  stopStream(pid: number): void {
    if (this.instance && pid > 0) {
      logger.info(`Stopping GStreamer with PID: ${pid}`);
      this.instance.kill('SIGKILL');
    } else {
      logger.error('Cannot stop GStreamer: instance is undefined or invalid, force stopping process');
      if (pid > 0) process.kill(pid, 'SIGKILL');
    }
  }

  private handleProcessOutputs(instance: any) {
    if (instance?.stderr) {
      instance.stderr.on('data', (data: any) => {
        logger.error(data.toString());
      });
    }

    if (instance?.stdout) {
      instance.stdout.on('data', (data: any) => {
        logger.info(data.toString());
      });
    }

    instance.on('error', (error: any) => {
      logger.error(error);
    });

    instance.on('close', (code: any) => {
      logger.info(`GStreamer process closed with code: ${code}`);
    });
  }
}
