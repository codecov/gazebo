// Gazebo harness integration layer

import config from 'config'

import {
  useFlags,
  useHarnessInit,
  withHarnessProvider as withHProvider,
} from './harness-react/HarnessReact'

function convertLDUserToHarness(user) {
  if (user) {
    const { key, name, custom, email, avatar } = user
    return {
      identifier: key?.toString(),
      name: name,
      attributes: { ...custom, email, avatar },
    }
  }
  return
}

export function withHarnessProvider(Component) {
  if (config.HARNESS) {
    return withHProvider(Component)
  }
  return Component
}

export function useHarnessFlags(fallback) {
  const flags = useFlags()
  if (config.HARNESS) {
    return Object.entries(flags).length > 0 ? flags : fallback
  } else {
    // Throw an error to remind dev's we need to provide a fallback for self hosted.
    if (!fallback) {
      console.error(
        'Warning! Self hosted build is missing a default feature flag value.'
      )
    }
    return fallback
  }
}

export function useHarnessIdentifyUser(user) {
  useHarnessInit({
    key: config.HARNESS,
    user: convertLDUserToHarness(user),
    enabled: !!(config.HARNESS && !user?.guest && user?.key),
    options: { debug: config.NODE_ENV !== 'production' },
  })
}
