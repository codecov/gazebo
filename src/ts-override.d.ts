declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGAttributes<SVGElement>
  >
}

declare module '*.png' {
  const value: any
  export = value
}
