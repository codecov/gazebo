export {}

declare global {
  interface Window {
    configEnv: { [key: string]: string | number }
  }
}
