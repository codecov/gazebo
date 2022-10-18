export function dataMarketingType(props, propName) {
  if (props[propName] === undefined || typeof props[propName] != 'string') {
    return new Error('You must provide prop "dataMarketing" of type string.')
  }
}
