import { withLDProvider } from 'launchdarkly-react-client-sdk'
import config from 'config'

// This is an older pattern that launch darkly still uses.
export const withLaunchDarkly = (App) => {
  if (config.LAUNCHDARKLY) {
    return withLDProvider({
      clientSideID: config.LAUNCHDARKLY,
      options: {
        bootstrap: 'localStorage',
        diagnosticOptOut: true,
      },
    })(App)
  }
  return App
}
