import * as Sentry from '@sentry/react'
import { createBrowserHistory } from 'history'
import { Route } from 'react-router-dom'

import config from './config'

// Custom ignored errors
const customIgnoredErrors: string[] = [
  /*
   * App throwing an error if it can't find a module. We have resolved this
   * with two different methods, we're storing assets from previous builds, as
   * well when this error is triggered we automatically refresh the users
   * window to load in the new data (which is triggered by this error).
   */
  // Removing this for the time being, to see if we can resolve it fully
  // 'Failed to fetch dynamically imported module',

  /*
   * Bug in @sentry-internal/replay SDK (< 9.x patch): the web worker message
   * listener reads `response.method` without guarding against a null `data`
   * payload, which can happen in Chrome when a synthetic or external
   * postMessage arrives with no data. This crash originates entirely inside
   * Sentry's own replay internals and has no impact on the user.
   * See: https://github.com/getsentry/sentry-javascript/issues (replay worker null data)
   */
  "Cannot read properties of null (reading 'method')",
]

/**
 * Returns true if every stack frame in the event originates from
 * @sentry-internal/replay, indicating the error is an SDK-internal crash
 * rather than an application error.
 */
const isSentryReplayInternalError = (event: Sentry.ErrorEvent): boolean => {
  const exceptions = event.exception?.values ?? []
  if (exceptions.length === 0) return false

  return exceptions.every((exception) => {
    const frames = exception.stacktrace?.frames ?? []
    if (frames.length === 0) return false
    return frames.every(
      (frame) =>
        frame.filename?.includes('@sentry-internal/replay') ||
        frame.filename?.includes('@sentry/replay')
    )
  })
}

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

      // Drop errors that originate entirely from Sentry's own replay internals
      // (e.g. the null-data worker message listener bug in @sentry-internal/replay).
      if (isSentryReplayInternalError(event)) {
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
