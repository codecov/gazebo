/* eslint-disable camelcase */
import { metrics as sentryMetrics } from '@sentry/react'

type MetricKeyNameUnion<T, K extends string = ''> = {
  [P in keyof T]: T[P] extends object
    ? MetricKeyNameUnion<T[P], `${K}${K extends '' ? '' : '.'}${string & P}`>
    : `${K}${K extends '' ? '' : '.'}${string & P}`
}[keyof T]

type DistributionKeys = {
  // TODO: Remove this key when adding in non-test keys
  testKey: string
}

type GaugeKeys = {
  billing_change: {
    user: {
      seats_change: string
    }
  }
}

type IncrementKeys = {
  coverage_tab: {
    visited_page: string
  }
  commit_detail_page: {
    coverage_page: {
      visited_page: string
    }
    coverage_dropdown: {
      opened: string
    }
    bundle_page: {
      visited_page: string
    }
    bundle_dropdown: {
      opened: string
    }
  }
  pull_request_page: {
    coverage_page: {
      visited_page: string
    }
    coverage_dropdown: {
      opened: string
    }
    bundle_page: {
      visited_page: string
    }
    bundle_dropdown: {
      opened: string
    }
  }
  bundles_tab: {
    bundle_details: {
      visited_page: string
    }
    onboarding: {
      visited_page: string
      copied: {
        token: string
        config: string
        commit: string
        install_command: string
        build_command: string
      }
    }
  }
  network_errors: {
    network_status: {
      '401': string
      '403': string
      '404': string
      '429': string
      '500': string
    }
    graphql: {
      unauthenticated_error: string
      unauthorized_error: string
      not_found_error: string
    }
  }
  request_install: {
    user: {
      shared: {
        request: string
      }
    }
  }
  billing_change: {
    user: {
      visited_page: string
      checkout_from_page: string
    }
  }
  button_clicked: {
    theme: {
      light: string
      dark: string
    }
  }
}

type SetKeys = {
  // TODO: Remove this key when adding in non-test keys
  testKey: string
}

type DistributionValue = Parameters<typeof sentryMetrics.distribution>['1']
type DistributionData = Parameters<typeof sentryMetrics.distribution>['2']

type GaugeValue = Parameters<typeof sentryMetrics.gauge>['1']
type GaugeData = Parameters<typeof sentryMetrics.gauge>['2']

type IncrementValue = Parameters<typeof sentryMetrics.increment>['1']
type IncrementData = Parameters<typeof sentryMetrics.increment>['2']

type SetValue = Parameters<typeof sentryMetrics.set>['1']
type SetData = Parameters<typeof sentryMetrics.set>['2']

export const metrics = {
  distribution: (
    name: MetricKeyNameUnion<DistributionKeys>,
    value: DistributionValue,
    data?: DistributionData
  ) => {
    sentryMetrics.distribution(name, value, data)
  },
  gauge: (
    name: MetricKeyNameUnion<GaugeKeys>,
    value: GaugeValue,
    data?: GaugeData
  ) => {
    sentryMetrics.gauge(name, value, data)
  },
  increment: (
    name: MetricKeyNameUnion<IncrementKeys>,
    value?: IncrementValue,
    data?: IncrementData
  ) => {
    sentryMetrics.increment(name, value, data)
  },
  set: (name: MetricKeyNameUnion<SetKeys>, value: SetValue, data?: SetData) => {
    sentryMetrics.set(name, value, data)
  },
} as const
