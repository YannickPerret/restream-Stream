import {DateTime} from 'luxon'
import {BaseModel, column, hasMany} from '@adonisjs/lucid/orm'
import logger from '@adonisjs/core/services/logger'
import Video from '#models/video'
import VideoEncoder from '#models/video_encoder'
import type {HasMany} from '@adonisjs/lucid/types/relations'
import QueueItem from '#models/queue_item'
import fs from 'node:fs'
import Asset from "#models/asset";

export default class Queue extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare active: boolean

  @column()
  declare maxSlots: number

  @column()
  declare maxConcurrent: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => QueueItem)
  declare items: HasMany<typeof QueueItem>

  // Utilisez des variables statiques pour partager l'état entre les instances
  private static currentEncodings: number = 0

  private static instance: Queue

  static getInstance(): Queue {
    if (!Queue.instance) {
      Queue.instance = new Queue()
    }
    return Queue.instance
  }

  static async findOrCreateQueue(): Promise<Queue> {
    let queue = await this.query().where('active', true).preload('items').first()
    if (!queue) {
      queue = await Queue.create({
        title: 'Default Queue',
        active: true,
        maxSlots: 50,
        maxConcurrent: 1,
      })
    }
    return queue
  }

  async add(
    video: Video,
    startTimeCode: string | null,
    endTimeCode: string | null
  ): Promise<void> {
    let queue = await Queue.findOrCreateQueue()

    // Vérifiez les slots actifs
    const activeItemsCount = await QueueItem.query()
      .where('queueId', queue.id)
      .andWhere((builder) => {
        builder.where('status', 'pending').orWhere('status', 'processing')
      })
      .count('* as total')

    const totalActiveItems = Number(activeItemsCount[0].$extras.total)

    // Si la file est pleine, créez une nouvelle file et ajoutez-y l'élément
    if (totalActiveItems >= queue.maxSlots) {
      queue = await Queue.create({
        title: `Queue ${DateTime.now().toFormat('yyyyLLddHHmmss')}`,
        active: true,
        maxSlots: queue.maxSlots,
        maxConcurrent: queue.maxConcurrent,
      })
    }

    await QueueItem.create({
      queueId: queue.id,
      videoId: video.id,
      startTimeCode,
      endTimeCode,
      status: 'pending',
      attempts: 0,
    })

    await this.runEncoding(queue.id)
  }

  private async runEncoding(queueId: number): Promise<void> {
    const queue = await Queue.query().where('id', queueId).preload('items').first()
    if (!queue || !queue.active) return

    const pendingQueueItems = await QueueItem.query()
      .where('queueId', queueId)
      .andWhere('status', 'pending')
      .limit(1)

    if (pendingQueueItems.length === 0 || Queue.currentEncodings >= queue.maxConcurrent) {
      return
    }

    Queue.currentEncodings++

    const queueItem = pendingQueueItems[0]
    queueItem.status = 'processing'
    await queueItem.save()

    const video = await Video.find(queueItem.videoId)
    if (!video) {
      logger.error(`Video with ID ${queueItem.videoId} not found`)
      queueItem.status = 'failed'
      await queueItem.save()
      return
    }

    try {
      // Encodage de la vidéo
      const encodedPath = await VideoEncoder.encode(
        video,
        queueItem.startTimeCode,
        queueItem.endTimeCode,
        1
      );
      logger.info(`Video encoded successfully. New path: ${encodedPath}`);

      // Upload vers S3
      const videoFile = {
        path: encodedPath,
        extname: encodedPath.split('.').pop(),
      };
      // Mise à jour du chemin de la vidéo et sauvegarde
      video.path = await Asset.uploadToS3(videoFile, `videos/${video.userId}`);
      await video.save();

      // Marquer l'élément de la file comme complété
      queueItem.status = 'completed';
      await queueItem.save();

      // Supprimer le fichier encodé local après l'upload réussi
      await this.deleteFile(encodedPath);
    } catch (error) {
      logger.error('An error occurred during encoding or uploading:', error);

      // Vérifier si l'encodage a échoué
      if (error.message.includes('ffmpeg')) {
        // L'encodage a échoué, on peut réessayer
        queueItem.attempts += 1;
        if (queueItem.attempts < 3) {
          queueItem.status = 'pending';
        } else {
          queueItem.status = 'failed';
          await queueItem.delete();
        }
      } else {
        // L'erreur s'est produite après l'encodage, inutile de réessayer l'encodage
        queueItem.status = 'failed';
        await queueItem.delete();
      }

      await queueItem.save();
    } finally {
      Queue.currentEncodings--;
    }

    // Traitez le prochain élément dans la file
    await this.processQueue(queueId)
  }

  private async processQueue(queueId: number): Promise<void> {
    const nextItem = await QueueItem.query()
      .where('queueId', queueId)
      .andWhere('status', 'pending')
      .first()

    if (nextItem) {
      await this.runEncoding(queueId)
    }
  }

  private async deleteFile(filePath: string): Promise<void> {
    try {
      logger.info(`Attempting to delete file: ${filePath}`)
      await fs.promises.unlink(filePath)
    } catch (error) {
      logger.error('Failed to delete file', error)
    }
  }
}
