/* eslint-disable no-restricted-imports */
import {
  useFlags,
  useLDClient,
  withLDProvider,
} from 'launchdarkly-react-client-sdk'
import { useEffect } from 'react'

import config from 'config'

export const withLaunchDarklyProvider = (Component) => {
  if (config.LAUNCHDARKLY) {
    return withLDProvider({
      clientSideID: config.LAUNCHDARKLY,
      options: {
        bootstrap: 'localStorage',
      },
    })(Component)
  }
  return Component
}

/*
    In the future we might want to have a larger config to control
    features by licensing / configuration. This is fine for now though.
  */
export function useLDFlags(fallback) {
  if (config.LAUNCHDARKLY) {
    return useFlags
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

// https://launchdarkly.github.io/js-client-sdk/interfaces/_launchdarkly_js_client_sdk_.lduser.html
export function useIdentifyLDUser(user) {
  const ldClient = useLDClient()

  useEffect(() => {
    if (config.LAUNCHDARKLY && ldClient) {
      if (!user?.guest && user?.key) {
        ldClient.identify(user)
      }
    }
  }, [user, ldClient])
}
