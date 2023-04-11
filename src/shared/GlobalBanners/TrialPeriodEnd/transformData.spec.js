import { transformData } from './transformData'

describe('transformData', () => {
  it('returns undefined daysLeftInTrial and banner should hide when subscription is null', () => {
    const subscriptionDetailMock = null
    expect(transformData(subscriptionDetailMock)).toStrictEqual({
      daysLeftInTrial: undefined,
      shouldHideBanner: true,
    })
  })

  it('returns undefined daysLeftInTrial and banner should hide when there isnt a trial or there is payment info', () => {
    const subscriptionDetailMock = {
      trialEnd: null,
      defaultPaymentMethod: {
        card: 'some_card',
        billingDetails: 'some details',
      },
    }
    expect(transformData(subscriptionDetailMock)).toStrictEqual({
      daysLeftInTrial: undefined,
      shouldHideBanner: true,
    })
  })

  it('returns undefined daysLeftInTrial and banner should hide when date difference is more than 7 days', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-7'))

    const subscriptionDetailMock = {
      trialEnd: 1681551394,
      defaultPaymentMethod: null,
    }
    expect(transformData(subscriptionDetailMock)).toStrictEqual({
      daysLeftInTrial: undefined,
      shouldHideBanner: true,
    })
  })

  it('returns daysLeftInTrial and banner should not hide when date difference less than 7 days', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-8'))
    const subscriptionDetailMock = {
      trialEnd: 1681551394,
      defaultPaymentMethod: null,
    }
    expect(transformData(subscriptionDetailMock)).toStrictEqual({
      daysLeftInTrial: 7,
      shouldHideBanner: false,
    })
  })
})
