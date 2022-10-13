export function marketingHookType(props, propName) {
  if (props[propName] === undefined || typeof props[propName] != 'string') {
    return new Error('You must provide prop "hook" of type string.')
  }
}
