import * as Sentry from '@sentry/react'

import { metrics } from './metrics'

describe('metrics wrapper', () => {
  describe('distribution', () => {
    it('calls sentry distribution', () => {
      metrics.distribution('testKey', 1)

      expect(Sentry.metrics.distribution).toHaveBeenCalledWith(
        'testKey',
        1,
        undefined
      )
    })
  })

  describe('gauge', () => {
    it('calls sentry gauge', () => {
      metrics.gauge('billing_change.user.seats_change', 1)

      expect(Sentry.metrics.gauge).toHaveBeenCalledWith(
        'billing_change.user.seats_change',
        1,
        undefined
      )
    })
  })

  describe('increment', () => {
    it('calls sentry increment', () => {
      metrics.increment('coverage_tab.visited_page', 1)

      expect(Sentry.metrics.increment).toHaveBeenCalledWith(
        'coverage_tab.visited_page',
        1,
        undefined
      )
    })
  })

  describe('set', () => {
    it('calls sentry set', () => {
      metrics.set('testKey', 1)

      expect(Sentry.metrics.set).toHaveBeenCalledWith('testKey', 1, undefined)
    })
  })
})
