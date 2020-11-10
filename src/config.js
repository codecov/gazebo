const defaultConfig = {}

const config = {
  ...defaultConfig,
  ...process.env,
  ...window.configEnv,
}

export default config
