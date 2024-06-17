import vine from '@vinejs/vine'

export const videoValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(255),
    isPublished: vine.boolean(),
    showInLive: vine.boolean(),
    videoFile: vine.file({
      extnames: ['mp4', 'avi', 'mov', 'mts'],
      size: '20gb',
    })
  })
)
