import type { HttpContext } from '@adonisjs/core/http'
import Stripe from 'stripe'
import env from '#start/env'
import Order from '#models/Order'
import Payment from '#models/Payment'
import User from '#models/user'

const stripe = new Stripe(env.get('STRIPE_KEY_PRIVATE'), {
  apiVersion: '2024-06-20',
})

export default class PaymentsController {}
