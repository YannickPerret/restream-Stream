import vine from '@vinejs/vine'

export const providerValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(64),
    providerType: vine.string().minLength(3).maxLength(64),
    clientId: vine.string().minLength(3).maxLength(64),
    clientSecret: vine.string().minLength(3).maxLength(64),
    refreshToken: vine.string().minLength(3).maxLength(64),
    broadcasterId: vine.string().minLength(3).maxLength(64),
    authToken: vine.string().minLength(3).maxLength(64),
    streamKey: vine.string().minLength(3).maxLength(64),
  })
)
