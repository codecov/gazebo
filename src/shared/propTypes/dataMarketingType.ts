export function dataMarketingType(
  props: { [x: string]: any },
  propName: string | number
) {
  if (props[propName] === undefined || typeof props[propName] != 'string') {
    return new Error('You must provide prop "dataMarketing" of type string.')
  }
}
