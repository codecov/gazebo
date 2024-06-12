/* eslint-disable camelcase */
import { rest } from 'msw'

const accountDetailsUri = '/internal/:provider/:owner/account-details/'

export const randomAccountDetailsHandler = rest.get(
  accountDetailsUri,
  (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(accountDetailsObject))
  }
)

export const invoiceObject = {
  amountDue: 1407.0,
  amountPaid: 1407.0,
  created: 1634910009,
  currency: 'usd',
  customerAddress: null,
  customerName: 'Accounts Payable Codecov',
  customerEmail: 'bobSmith@bobsmith.com',
  defaultPaymentMethod: null,
  dueDate: 1637502009,
  footer: 'foot',
  id: 'in_1JnNyfGlVGuVgOrkkdkCYayW',
  lineItems: [
    {
      description: 'Unused time on 21 × users-pr-inappm after 22 Oct 2021',
      amount: -14766.0,
      currency: 'usd',
    },
    {
      description: 'Remaining time on 23 × users-pr-inappm after 22 Oct 2021',
      amount: 16173.0,
      currency: 'usd',
    },
  ],
  number: 'BE7E6CB0-0031',
  periodEnd: 1634910008,
  periodStart: 1633801075,
  status: 'paid',
  subtotal: 1407.0,
  total: 1407.0,
}

export const accountDetailsObject = {
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
      'Configurable # of users',
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
        last4: '8091',
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
    trial_end: null,
    cancel_at_period_end: false,
    current_period_end: 1636479475,
    customer: {
      id: 'blahblah',
      discount: {
        name: 'yep',
        percent_off: 25,
        duration_in_months: 12,
        expires: 1,
      },
      email: 'niceone@gmail.com',
    },
    collection_method: null,
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
  uses_invoice: true,
  schedule_detail: null,
}

export const accountDetailsParsedObj = {
  integrationId: 1271,
  activatedUserCount: 19,
  inactiveUserCount: 5,
  planAutoActivate: true,
  plan: {
    marketingName: 'Pro Team',
    value: 'users-pr-inappm',
    billingRate: 'monthly',
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    quantity: 20,
  },
  subscriptionDetail: {
    latestInvoice: {
      id: 'in_1JnNyfGlVGuVgOrkkdkCYayW',
      number: 'BE7E6CB0-0031',
      status: 'paid',
      created: 1634910009,
      periodStart: 1633801075,
      periodEnd: 1634910008,
      dueDate: 1637502009,
      customerAddress: null,
      customerName: 'Accounts Payable Codecov',
      currency: 'usd',
      amountPaid: 1407.0,
      amountDue: 1407.0,
      amountRemaining: 0.0,
      total: 1407.0,
      subtotal: 1407.0,
      invoicePdf:
        'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/live_YWNjdF8xNFNKVE9HbFZHdVZnT3JrLF9LU0laYWVJMGZMaXNDVUpIa28xeVJoT3NmUlhrU2tz0100SEABsdVD/pdf',
      lineItems: [
        {
          description: 'Unused time on 21 × users-pr-inappm after 22 Oct 2021',
          amount: -14766.0,
          currency: 'usd',
          period: {
            end: 1636479475,
            start: 1634910008,
          },
          planName: 'users-pr-inappm',
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
          planName: 'users-pr-inappm',
          quantity: 23,
        },
      ],
    },
    defaultPaymentMethod: {
      card: {
        brand: 'mastercard',
        expMonth: 4,
        expYear: 2023,
        last4: '8091',
      },
      billingDetails: {
        address: {
          city: null,
          country: null,
          line1: null,
          line2: null,
          postalCode: null,
          state: null,
        },
        email: null,
        name: null,
        phone: null,
      },
    },
    trialEnd: null,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: 1636479475,
    customer: {
      id: 'blahblah',
      discount: {
        name: 'yep',
        percentOff: 25,
        durationInMonths: 12,
        expires: 1,
      },
      email: 'niceone@gmail.com',
    },
    collectionMethod: null,
  },
  checkoutSessionId: null,
  name: 'codecov',
  email: null,
  nbActivePrivateRepos: 12,
  repoTotalCredits: 99999999,
  planProvider: null,
  rootOrganization: null,
  activatedStudentCount: 1,
  studentCount: 1,
  usesInvoice: true,
  scheduleDetail: null,
}
