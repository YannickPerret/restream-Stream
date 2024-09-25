import vine from '@vinejs/vine'

const streamValidator = vine.object({
  name: vine.string().trim().minLength(3).maxLength(255),
  logo: vine.string().optional(),
  overlay: vine.string().optional(),
})
