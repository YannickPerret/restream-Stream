import redis from '@adonisjs/redis/services/main'

export default class RedisProvider {
  /**
   * Sauvegarder une donnée générique dans Redis avec un préfixe
   * @param prefix - Le préfixe pour la clé Redis
   * @param id - L'ID pour la clé spécifique
   * @param data - Les données à sauvegarder
   */
  static async save<T>(prefix: string, id: string, data: T) {
    await redis.set(`${prefix}:${id}`, JSON.stringify(data))
    console.log(`Data with ID ${id} has been saved to Redis under prefix ${prefix}`)
  }

  /**
   * Récupérer une donnée générique depuis Redis avec un préfixe
   * @param prefix - Le préfixe pour la clé Redis
   * @param id - L'ID spécifique de la donnée à récupérer
   */
  static async get<T>(prefix: string, id: string): Promise<T | null> {
    const data = await redis.get(`${prefix}:${id}`)
    if (!data) {
      console.log(`Data with ID ${id} not found in Redis under prefix ${prefix}`)
      return null
    }
    return JSON.parse(data) as T
  }

  /**
   * Supprimer une donnée depuis Redis avec un préfixe
   * @param prefix - Le préfixe pour la clé Redis
   * @param id - L'ID spécifique de la donnée à supprimer
   */
  static async delete(prefix: string, id: string) {
    await redis.del(`${prefix}:${id}`)
    console.log(`Data with ID ${id} has been deleted from Redis under prefix ${prefix}`)
  }

  /**
   * Publier un message via Redis Pub/Sub
   * @param channel - Le canal Redis pour publier le message
   * @param message - Le message à publier
   */
  static async publish<T>(channel: string, message: T) {
    await redis.publish(channel, JSON.stringify(message))
    console.log(`Message published to channel ${channel}`)
  }

  /**
   * S'abonner à un canal Redis pour écouter des messages
   * @param channel - Le canal Redis à écouter
   * @param callback - La fonction à appeler lors de la réception d'un message
   */
  static async subscribe<T>(channel: string, callback: (message: T) => void) {
    await redis.subscribe(channel, (message) => {
      const parsedMessage = JSON.parse(message) as T
      callback(parsedMessage)
    })
    console.log(`Subscribed to channel ${channel}`)
  }
}
