const defaultConfig = {
  API_URL: '',
}

const config = {
  ...defaultConfig,
  ...process.env,
  ...window.configEnv,
}

export default config
