export {}

declare module 'config' {
  export interface config {
    [key: string]: string | number
  }
}
