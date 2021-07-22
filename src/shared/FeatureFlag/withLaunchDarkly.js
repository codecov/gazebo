import { withLDProvider } from 'launchdarkly-react-client-sdk'
import config from 'config'

// Can we make the withLDProvider import conditional?

// This is an older pattern that launch darkly still uses.
export const withLaunchDarkly = (App) => {
  if (config.LAUNCHDARKLY) {
    return withLDProvider({
      clientSideID: config.LAUNCHDARKLY,
      options: {
        bootstrap: 'localStorage',
      },
    })(App)
  }
  return App
}
