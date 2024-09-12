import mapKeys from 'lodash/mapKeys'

const defaultConfig = {
  API_URL: '',
  STRIPE_KEY: '',
  SENTRY_ENVIRONMENT: 'staging',
  SENTRY_TRACING_SAMPLE_RATE: 1.0,
  SENTRY_PROFILING_SAMPLE_RATE: 0.1,
  SENTRY_SESSION_SAMPLE_RATE: 0.1,
  SENTRY_ERROR_SAMPLE_RATE: 1.0,
  GH_APP: 'codecov',
}

// To be removed after we're satisfied session_expiry cookie cleanup is complete
export const LOCAL_STORAGE_SESION_EXPIRED_KEY = 'expired_session'
export const LOCAL_STORAGE_SESSION_TRACKING_KEY = 'tracking-session-expiry'
export const COOKIE_SESSION_EXPIRY = 'session_expiry'

export function removeReactAppPrefix(obj) {
  // in .env file, the variable must start with REACT_APP_
  // to be injected in the application, so we remove that
  // prefix to be more convenient for us
  const keys = mapKeys(obj, (_, key) => key.replace('REACT_APP_', ''))

  if ('ENV' in keys) {
    keys['IS_SELF_HOSTED'] = keys['ENV'].toLowerCase() === 'enterprise'
  }

  if ('IS_DEDICATED_NAMESPACE' in keys) {
    keys['IS_DEDICATED_NAMESPACE'] =
      keys['IS_DEDICATED_NAMESPACE'].toLowerCase() === 'true'
  }

  if ('HIDE_ACCESS_TAB' in keys) {
    keys['HIDE_ACCESS_TAB'] = keys['HIDE_ACCESS_TAB'].toLowerCase() === 'true'
  }

  if ('SENTRY_TRACING_SAMPLE_RATE' in keys) {
    keys['SENTRY_TRACING_SAMPLE_RATE'] = parseFloat(
      keys['SENTRY_TRACING_SAMPLE_RATE']
    )
  }

  if ('SENTRY_PROFILING_SAMPLE_RATE' in keys) {
    keys['SENTRY_PROFILING_SAMPLE_RATE'] = parseFloat(
      keys['SENTRY_PROFILING_SAMPLE_RATE']
    )
  }

  if ('SENTRY_SESSION_SAMPLE_RATE' in keys) {
    keys['SENTRY_SESSION_SAMPLE_RATE'] = parseFloat(
      keys['SENTRY_SESSION_SAMPLE_RATE']
    )
  }

  if ('SENTRY_ERROR_SAMPLE_RATE' in keys) {
    keys['SENTRY_ERROR_SAMPLE_RATE'] = parseFloat(
      keys['SENTRY_ERROR_SAMPLE_RATE']
    )
  }

  return keys
}

const config = {
  ...defaultConfig,
  ...removeReactAppPrefix(process.env),
  ...window.configEnv,
}

export default config
