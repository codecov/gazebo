import * as Sentry from '@sentry/react'
import { createBrowserHistory } from 'history'
import { Route } from 'react-router-dom'

import config from './config'

// Custom ignored errors
const customIgnoredErrors = [
  /*
   * LD could fail for a multiple reasons, network issues, server issues, rate
   * limiting, etc. We can't really help if if LD fails to fetch, so we ignore
   * it. We also provide a fallback value to our feature flags so if this
   * fails the app won't break.
   */
  'LaunchDarklyFlagFetchError',
  /*
   * App throwing an error if it can't find a module. We have resolved this
   * with two different methods, we're storing assets from previous builds, as
   * well when this error is triggered we automatically refresh the users
   * window to load in the new data (which is triggered by this error).
   */
  // Removing this for the time being, to see if we can resolve it fully
  // 'Failed to fetch dynamically imported module',
]

// common ignore errors / URLs to de-clutter Sentry
// https://docs.sentry.io/platforms/javascript/guides/react/configuration/filtering/#decluttering-sentry
const deClutterConfig = {
  ignoreErrors: [
    // Random plugins/extensions
    'top.GLOBALS',
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'http://tt.epicplay.com',
    "Can't find variable: ZiteReader",
    'jigsaw is not defined',
    'ComboSearch is not defined',
    'http://loading.retry.widdit.com/',
    'atomicFindClose',
    // Facebook borked
    'fb_xd_fragment',
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
    // reduce this. (thanks @acdha)
    // See http://stackoverflow.com/questions/4113268
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
    'conduitPage',
    ...customIgnoredErrors,
  ],
  denyUrls: [
    // Facebook flakiness
    /graph\.facebook\.com/i,
    // Facebook blocked
    /connect\.facebook\.net\/en_US\/all\.js/i,
    // Woopra flakiness
    /eatdifferent\.com\.woopra-ns\.com/i,
    /static\.woopra\.com\/js\/woopra\.js/i,
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Other plugins
    /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
    /webappstoolbarba\.texthelp\.com\//i,
    /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
  ],
}

export const SentryRoute = Sentry.withSentryRouting(Route)

const checkForBlockedUserAgents = () => {
  const userAgents = ['Bytespider']

  return userAgents.some((agent) =>
    window?.navigator?.userAgent.includes(agent)
  )
}

// Bug report user feedback form in user onboarding
export const SentryBugReporter = Sentry.feedbackIntegration({
  colorScheme: 'light',
  showBranding: false,
  formTitle: 'Give Feedback',
  buttonLabel: 'Give Feedback',
  submitButtonLabel: 'Send Feedback',
  messagePlaceholder:
    'Share your experience and suggest opportunities for improvement.',
  nameLabel: 'Username',
  isEmailRequired: true,
  autoInject: false,
})

// Help dropdown user feedback form
export const SentryUserFeedback = (isDark: boolean) =>
  Sentry.feedbackIntegration({
    showBranding: false,
    colorScheme: isDark ? 'dark' : 'light',
    formTitle: 'Give Feedback',
    buttonLabel: 'Give Feedback',
    submitButtonLabel: 'Send Feedback',
    messagePlaceholder:
      'Share your experience and suggest opportunities for improvement.',
    nameLabel: 'Username',
    isEmailRequired: true,
    autoInject: false,
    id: 'help-dropdown-widget',
  })

export const setupSentry = ({
  history,
}: {
  history: ReturnType<typeof createBrowserHistory>
}) => {
  // no sentry dsn, don't init
  if (!config.SENTRY_DSN) {
    return
  }

  const tracePropagationTargets = ['api.codecov.io', 'stage-api.codecov.dev']
  // wrapped in a silent try/catch incase the URL is invalid
  try {
    const { hostname } = new URL(config.API_URL)
    // add the hostname to the tracePropagationTargets if it's not already there
    if (!tracePropagationTargets.includes(hostname)) {
      tracePropagationTargets.push(hostname)
    }
  } catch {
    // do nothing
  }

  Sentry.init({
    dsn: config.SENTRY_DSN,
    debug: config.SENTRY_ENVIRONMENT !== 'production',
    environment: config.SENTRY_ENVIRONMENT,
    integrations: [
      // Adds Sentry Replay
      Sentry.replayIntegration(),

      // Adds Sentry browser profiling
      Sentry.browserProfilingIntegration(),

      // Adds routing instrumentation
      Sentry.reactRouterV5BrowserTracingIntegration({
        history,
      }),

      // Applies a `third_party_code: true` tag to all events that contain code that was not bundled with gazebo.
      // Allows for filtering of browser extension and random browser errors.
      Sentry.thirdPartyErrorFilterIntegration({
        filterKeys: ['gazebo'],
        behaviour: 'apply-tag-if-contains-third-party-frames',
      }),

      // Adds LaunchDarkly integration for feature flag tracking/errors
      Sentry.launchDarklyIntegration(),

      // Conditionally adds Spotlight browser integration when in development mode
      // Note - you'll need to have a valid Sentry DSN to use this, and please set the SENTRY_ENVIRONMENT to your username or something unique
      ...(config.NODE_ENV === 'development'
        ? [Sentry.spotlightBrowserIntegration()]
        : []),
    ],
    tracePropagationTargets,
    tracesSampleRate: config?.SENTRY_TRACING_SAMPLE_RATE,
    // Capture n% of all sessions
    replaysSessionSampleRate: config?.SENTRY_SESSION_SAMPLE_RATE,
    // Of the remaining x% of sessions, if an error happens start capturing
    replaysOnErrorSampleRate: config?.SENTRY_ERROR_SAMPLE_RATE,
    // profiling sample rate
    profilesSampleRate: config?.SENTRY_PROFILING_SAMPLE_RATE,
    beforeSend: (event, _hint) => {
      if (checkForBlockedUserAgents()) {
        return null
      }

      return event
    },
    beforeSendTransaction: (event, _hint) => {
      if (checkForBlockedUserAgents()) {
        return null
      }

      return event
    },
    ...deClutterConfig,
  })
}
