import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

import { InvoiceSchema } from './useInvoices'

const query = `
query Invoice($owner: String!, $id: String!) {
  owner(username: $owner) {
    invoice(invoiceId: $id) {
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

const OwnerInvoiceSchema = z.object({
  owner: z
    .object({
      invoice: InvoiceSchema,
    })
    .nullable(),
})

interface UseInvoiceArgs {
  provider: string
  owner: string
  id: string
}

export const useInvoice = ({ provider, owner, id }: UseInvoiceArgs) =>
  useQuery({
    queryKey: ['Invoice', provider, owner, id],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          id,
        },
      }).then((res) => {
        const parsedData = OwnerInvoiceSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useInvoice - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        return parsedData.data.owner?.invoice ?? null
      }),
  })
