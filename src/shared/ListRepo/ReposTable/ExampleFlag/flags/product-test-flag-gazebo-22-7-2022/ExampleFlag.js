import { useFlags } from 'launchdarkly-react-client-sdk'

const ExampleFlag = () => {
  const { productTestFlagGazebo2272022 } = useFlags()
  return (
    productTestFlagGazebo2272022 !== 'isVisible' && (
      <p>Test: {productTestFlagGazebo2272022}</p>
    )
  )
}

export default ExampleFlag
