import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

const DefaultPaymentMethodSchema = z
  .object({
    billingDetails: z.object({
      address: z.object({
        city: z.string().nullable(),
        country: z.string().nullable(),
        line1: z.string().nullable(),
        line2: z.string().nullable(),
        postalCode: z.string().nullable(),
        state: z.string().nullable(),
      }),
      email: z.string().nullable(),
      name: z.string().nullable(),
      phone: z.string().nullable(),
    }),
    card: z.object({
      brand: z.string().nullable(),
      expMonth: z.number().nullable(),
      expYear: z.number().nullable(),
      last4: z.string().nullable(),
    }),
  })
  .nullable()

export const InvoiceSchema = z.object({
  amountDue: z.number(),
  amountPaid: z.number(),
  created: z.number(),
  currency: z.string(),
  customerAddress: z.string().nullable(),
  customerEmail: z.string().nullable(),
  customerName: z.string().nullable(),
  defaultPaymentMethod: DefaultPaymentMethodSchema,
  dueDate: z.number().nullable(),
  footer: z.string().nullable(),
  id: z.string(),
  lineItems: z.array(
    z.object({
      amount: z.number().nullable(),
      currency: z.string().nullable(),
      description: z.string().nullable(),
    })
  ),
  number: z.string().nullable(),
  periodEnd: z.number(),
  periodStart: z.number(),
  status: z.string().nullable(),
  subtotal: z.number(),
  taxIds: z.array(z.object({ value: z.string() }).nullable()),
  total: z.number(),
})

const InvoicesSchema = z.array(InvoiceSchema)

const OwnerInvoiceSchema = z.object({
  owner: z
    .object({
      invoices: InvoicesSchema,
    })
    .nullable(),
})

const query = `
query Invoices($owner: String!) {
  owner(username: $owner) {
    invoices {
      amountDue
      amountPaid
      created
      currency
      customerAddress
      customerEmail
      customerName
      dueDate
      footer
      id
      lineItems {
        amount
        currency
        description
      }
      number
      periodEnd
      periodStart
      status
      subtotal
      taxIds {
        value
      }
      total
      defaultPaymentMethod {
        card {
          brand
          expMonth
          expYear
          last4
        }
        billingDetails {
          address {
            city
            country
            line1
            line2
            postalCode
            state
          }
          email
          name
          phone
        }
      }
    }
  }
}
`

interface UseInvoicesArgs {
  provider: string
  owner: string
}

export const useInvoices = ({ provider, owner }: UseInvoicesArgs) =>
  useQuery({
    queryKey: ['Invoices', provider, owner],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
        },
      }).then((res) => {
        const callingFn = 'useInvoices'
        const parsedData = OwnerInvoiceSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedData.error },
          })
        }

        return parsedData.data.owner?.invoices ?? []
      }),
  })
