import mapKeys from 'lodash/mapKeys'

const defaultConfig = {
  API_URL: '',
  STRIPE_KEY: '',
  SENTRY_ENVIRONMENT: 'staging',
}

export function removeReactAppPrefix(obj) {
  // in .env file, the variable must start with REACT_APP_
  // to be injected in the application, so we remove that
  // prefix to be more convenient for us
  const keys = mapKeys(obj, (_, key) => key.replace('REACT_APP_', ''))

  if ('ENV' in keys) {
    keys['IS_ENTERPRISE'] = keys['ENV'].toLowerCase() === 'enterprise'
  }

  return keys
}

const config = {
  ...defaultConfig,
  ...removeReactAppPrefix(process.env),
  ...window.configEnv,
}

export default config
