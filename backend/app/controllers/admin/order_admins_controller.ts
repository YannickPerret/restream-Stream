import type { HttpContext } from '@adonisjs/core/http'
import Order from "#models/order";
import OrderItem from "#models/order_item";
import Payment from "#models/payment";
import mail from "@adonisjs/mail/services/main";

export default class OrderAdminsController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    // Authentifier l'utilisateur
    const user = auth.getUserOrFail();
    await user.load('role')

    // Vérifier le rôle admin
    if (user.role.name !== 'admin') {
      return response.unauthorized({ message: 'You do not have permission to view this resource.' });
    }

    try {
      const orders = await Order.query().preload('items', (itemQuery) => {
        itemQuery.preload('product');
      }).preload('payment');

      return response.ok({ success: true, orders });
    } catch (error) {
      return response.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  /**
   * Create a new order (for admin)
   */
  public async store({ request, response, auth }: HttpContext) {
    // Authentifier l'administrateur
    const adminUser = await auth.authenticate();

    // Extraire les données de la requête
    const {userId, items, totalAmount, paymentStatus, status, paymentMethodId, returnUrl} = request.only([
      'userId',          // L'ID de l'utilisateur pour lequel la commande est créée
      'items',           // Les produits commandés
      'totalAmount',     // Montant total
      'paymentStatus',   // Statut du paiement
      'status',          // Statut de la commande
      'paymentMethodId', // ID du moyen de paiement Stripe
      'returnUrl',       // URL de retour après paiement
    ]);

    try {
      // Vérifier si l'utilisateur existe
      const user = await User.findOrFail(userId);

      // Créer la commande pour l'utilisateur
      const order = await Order.create({
        userId: user.id,
        totalAmount,
        status: status || 'pending', // Statut de la commande
        paymentStatus: paymentStatus || 'pending', // Statut du paiement
      });

      // Créer les items de la commande
      await OrderItem.createMany(
        items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: 10, // Remplace par le vrai prix du produit
        }))
      );

      // Si la commande est en statut "waiting", créer un paiement et envoyer un email pour finaliser le paiement
      if (status === 'waiting') {
        // Créer un PaymentIntent Stripe pour l'utilisateur spécifié
        const paymentIntent = await Payment.createPaymentIntent(
          {totalAmount, id: order.id, currency: 'usd'},
          {id: user.id},
          {paymentMethodId, returnUrl}
        );

        // Enregistrer le paiement dans la base de données
        const payment = await Payment.create({
          orderId: order.id,
          stripePaymentIntentId: paymentIntent.id,
          amount: totalAmount,
          currency: 'usd',
          status: paymentIntent.status,
        });

        // Générer un lien de paiement Stripe
        const paymentLink = paymentIntent.next_action?.redirect_to_url?.url || returnUrl;

        // Envoyer un email à l'utilisateur pour lui demander de finaliser le paiement
        await Mail.send((message) => {
          message
            .from('no-reply@yourapp.com')
            .to(user.email)
            .subject(`Complete your payment for Order #${order.id}`)
            .htmlView('emails/payment-invitation', {user, order, paymentLink});
        });
      }

      return response.created({success: true, order});
    } catch (error) {
      console.error(error);
      return response.status(500).json({error: 'Failed to create order'});
    }
  }

  /**
   * Show individual order details
   */
  async show({ params, auth, response }: HttpContext) {
    // Authentifier l'utilisateur
    const user = await auth.authenticate();

    // Vérifier le rôle admin
    if (user.role.name !== 'admin') {
      return response.unauthorized({ message: 'You do not have permission to view this resource.' });
    }

    try {
      const order = await Order.query()
        .where('id', params.id)
        .preload('items', (itemQuery) => {
          itemQuery.preload('product');
        })
        .preload('payment')
        .firstOrFail();

      return response.ok({ success: true, order });
    } catch (error) {
      return response.status(404).json({ error: 'Order not found' });
    }
  }

  /**
   * Update an existing order (for admin)
   */
  async update({ params, request, auth, response }: HttpContext) {
    // Authentifier l'utilisateur
    const user = await auth.authenticate();

    // Vérifier le rôle admin
    if (user.role.name !== 'admin') {
      return response.unauthorized({ message: 'You do not have permission to perform this action.' });
    }

    const { status, paymentStatus } = request.only(['status', 'paymentStatus']);

    try {
      const order = await Order.query().where('id', params.id).firstOrFail();

      // Mettre à jour le statut et le statut de paiement
      order.status = status || order.status;
      order.paymentStatus = paymentStatus || order.paymentStatus;

      await order.save();

      return response.ok({ success: true, order });
    } catch (error) {
      return response.status(500).json({ error: 'Failed to update order' });
    }
  }

  /**
   * Delete an order (for admin)
   */
  async destroy({ params, auth, response }: HttpContext) {
    // Authentifier l'utilisateur
    const user = await auth.authenticate();

    // Vérifier le rôle admin
    if (user.role.name !== 'admin') {
      return response.unauthorized({ message: 'You do not have permission to perform this action.' });
    }

    try {
      const order = await Order.query().where('id', params.id).firstOrFail();

      await order.delete();

      return response.ok({ success: true, message: 'Order deleted' });
    } catch (error) {
      return response.status(500).json({ error: 'Failed to delete order' });
    }
  }
}
