import * as Sentry from '@sentry/react'
import { Replay } from '@sentry/replay'
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
    // Other plugins
    /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
    /webappstoolbarba\.texthelp\.com\//i,
    /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
  ],
}

export const SentryRoute = Sentry.withSentryRouting(Route)

export const setupSentry = ({ history }) => {
  const browserTracing = new Sentry.BrowserTracing({
    routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
    tracePropagationTargets: ['api.codecov.io', 'stage-api.codecov.dev'],
  })

  const replay = new Replay({
    // Capture 10% of all sessions
    sessionSampleRate: config?.SENTRY_SESSION_SAMPLE_RATE,

    // Of the remaining 90% of sessions, if an error happens start capturing
    errorSampleRate: config?.SENTRY_ERROR_SAMPLE_RATE,
  })

  return Sentry.init({
    dsn: config.SENTRY_DSN,
    debug: config.node_env !== 'production',
    release: config.SENTRY_RELEASE,
    environment: config.SENTRY_ENVIRONMENT,
    integrations: [browserTracing, replay],
    tracesSampleRate: config?.SENTRY_TRACING_SAMPLE_RATE,
    ...deClutterConfig,
  })
}
