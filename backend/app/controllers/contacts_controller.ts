import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class ContactsController {
  async send({ request, response }: HttpContext) {
    // Extraire les données du formulaire depuis la requête
    const { name, email, message, subject } = request.only(['name', 'email', 'message', 'subject'])

    try {
      // Envoyer l'email en utilisant le template Edge "form_contact"
      await mail.send((message_) => {
        message_
          .from('noreply@arcanastream.com', 'Arcana Stream')
          .to('contact@arcanastream.com')
          .replyTo(email)
          .subject(subject)
          .htmlView('emails/contacts/form_contact', { name, email, message, subject })
      })

      // Répondre avec un message de succès
      return response.status(200).send({ message: 'Email sent successfully' })
    } catch (error) {
      // En cas d'erreur, renvoyer un message d'erreur
      console.error('Failed to send email:', error)
      return response.status(500).send({ message: 'Failed to send email', error })
    }
  }
}
