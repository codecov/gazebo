import { generateAddressInfo } from './generateAddressInfo'

const accountDetails = {
  subscriptionDetail: {
    latestInvoice: 'in_1I3vJAGlVGuVgOrk5h77hHRa',
    defaultPaymentMethod: {
      card: {
        brand: 'visa',
        expMonth: 12,
        expYear: 2021,
        last4: '4242',
      },
      billingDetails: {
        address: {
          city: 'Bordeaux',
          country: 'France',
          line1: '12 cours st-louis',
          line2: 'apt-31',
          postalCode: '33000',
          state: 'Gironde',
        },
        email: null,
        name: 'Checo perez',
        phone: null,
      },
    },
    cancelAtPeriodEnd: false,
    currentPeriodEnd: 1640834708,
    customer: 'cus_IVd2T7puVJe1Ur',
  },
}

describe('generateAddressInfo', () => {
  it('returns expected address format', () => {
    const addressInfo = generateAddressInfo(accountDetails)

    expect(addressInfo).toStrictEqual([
      'Checo perez',
      '12 cours st-louis',
      'apt-31',
      'Bordeaux Gironde 33000 France',
    ])
  })
})
