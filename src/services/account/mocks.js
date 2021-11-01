/* eslint-disable camelcase */
import { rest } from 'msw'

const accountDetailsUri = '/internal/:provider/:owner/account-details/'

export const randomAccountDetailsHandler = rest.get(
  accountDetailsUri,
  (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(accountDetailsObject))
  }
)

const accountDetailsObject = {
  integration_id: 1271,
  activated_user_count: 19,
  inactive_user_count: 5,
  plan_auto_activate: true,
  plan: {
    marketing_name: 'Pro Team',
    value: 'users-pr-inappm',
    billing_rate: 'monthly',
    base_unit_price: 12,
    benefits: [
      'Configureable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    quantity: 20,
  },
  subscription_detail: {
    latest_invoice: {
      id: 'in_1JnNyfGlVGuVgOrkkdkCYayW',
      number: 'BE7E6CB0-0031',
      status: 'paid',
      created: 1634910009,
      period_start: 1633801075,
      period_end: 1634910008,
      due_date: 1637502009,
      customer_address: null,
      customer_name: 'Accounts Payable Codecov',
      currency: 'usd',
      amount_paid: 1407.0,
      amount_due: 1407.0,
      amount_remaining: 0.0,
      total: 1407.0,
      subtotal: 1407.0,
      invoice_pdf:
        'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/live_YWNjdF8xNFNKVE9HbFZHdVZnT3JrLF9LU0laYWVJMGZMaXNDVUpIa28xeVJoT3NmUlhrU2tz0100SEABsdVD/pdf',
      line_items: [
        {
          description: 'Unused time on 21 × users-pr-inappm after 22 Oct 2021',
          amount: -14766.0,
          currency: 'usd',
          period: {
            end: 1636479475,
            start: 1634910008,
          },
          plan_name: 'users-pr-inappm',
          quantity: 21,
        },
        {
          description:
            'Remaining time on 23 × users-pr-inappm after 22 Oct 2021',
          amount: 16173.0,
          currency: 'usd',
          period: {
            end: 1636479475,
            start: 1634910008,
          },
          plan_name: 'users-pr-inappm',
          quantity: 23,
        },
      ],
    },
    default_payment_method: {
      card: {
        brand: 'mastercard',
        exp_month: 4,
        exp_year: 2023,
        last4: 8091,
      },
      billing_details: {
        address: {
          city: null,
          country: null,
          line1: null,
          line2: null,
          postal_code: null,
          state: null,
        },
        email: null,
        name: null,
        phone: null,
      },
    },
    cancel_at_period_end: false,
    current_period_end: 1636479475,
  },
  checkout_session_id: null,
  name: 'codecov',
  email: null,
  nb_active_private_repos: 12,
  repo_total_credits: 99999999,
  plan_provider: null,
  root_organization: null,
  activated_student_count: 1,
  student_count: 1,
}
