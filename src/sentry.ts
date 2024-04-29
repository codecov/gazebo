import * as Sentry from '@sentry/react'
import * as Spotlight from '@spotlightjs/spotlight'
import { createBrowserHistory } from 'history'
import { Route } from 'react-router-dom'

import config from './config'

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

export const setupSentry = ({
  history,
}: {
  history: ReturnType<typeof createBrowserHistory>
}) => {
  // no sentry dsn, don't init
  if (!config.SENTRY_DSN) {
    return
  }

  // configure sentry product integrations
  const replay = Sentry.replayIntegration()
  const tracing = Sentry.reactRouterV5BrowserTracingIntegration({
    history,
  })

  const integrations = [replay, tracing]

  // Only show feedback button in production
  // spotlight takes the place of the feedback widget in dev mode
  if (config.NODE_ENV === 'production') {
    const feedback = Sentry.feedbackIntegration({
      colorScheme: 'light',
      showBranding: false,
      formTitle: 'Give Feedback',
      buttonLabel: 'Give Feedback',
      submitButtonLabel: 'Send Feedback',
      nameLabel: 'Username',
      isEmailRequired: true,
    })
    integrations.push(feedback)
  }

  const tracePropagationTargets = ['api.codecov.io', 'stage-api.codecov.dev']
  // wrapped in a silent try/catch incase the URL is invalid
  try {
    const { hostname } = new URL(config.API_URL)
    // add the hostname to the tracePropagationTargets if it's not already there
    if (!tracePropagationTargets.includes(hostname)) {
      tracePropagationTargets.push(hostname)
    }
  } catch {}

  Sentry.init({
    dsn: config.SENTRY_DSN,
    debug: config.NODE_ENV !== 'production',
    release: config.SENTRY_RELEASE,
    environment: config.SENTRY_ENVIRONMENT,
    integrations,
    tracePropagationTargets,
    tracesSampleRate: config?.SENTRY_TRACING_SAMPLE_RATE,
    // Capture n% of all sessions
    replaysSessionSampleRate: config?.SENTRY_SESSION_SAMPLE_RATE,
    // Of the remaining x% of sessions, if an error happens start capturing
    replaysOnErrorSampleRate: config?.SENTRY_ERROR_SAMPLE_RATE,
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

  if (config.NODE_ENV === 'development') {
    Spotlight.init({
      injectImmediately: true,
      integrations: [Spotlight.sentry()],
    })
  }
}
