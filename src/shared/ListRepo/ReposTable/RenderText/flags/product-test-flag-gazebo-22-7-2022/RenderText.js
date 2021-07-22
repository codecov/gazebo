import { useFlags } from 'launchdarkly-react-client-sdk'

const RenderText = () => {
  const { productTestFlagGazebo2272022 } = useFlags()
  return <p>Test: {productTestFlagGazebo2272022}</p>
}

export default RenderText
