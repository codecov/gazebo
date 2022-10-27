import {
  useHarnessFlags,
  useHarnessIdentifyUser,
  withHarnessProvider,
} from './flagProvider/harness'
import {
  useIdentifyLDUser,
  useLDFlags,
  withLaunchDarklyProvider,
} from './flagProvider/launchdarkly'

export const withFeatureFlagProvider = (Component) => {
  return withHarnessProvider(withLaunchDarklyProvider(Component))
}

// We need to be careful about duplicate flag names per service while we migrate.
export function useFlags(fallback) {
  return { ...useLDFlags(fallback), ...useHarnessFlags(fallback) }
}

export function useIdentifyUser(user) {
  useIdentifyLDUser(user)
  useHarnessIdentifyUser(user)
}
