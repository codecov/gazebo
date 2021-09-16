import PropTypes from 'prop-types'

import { useFlags } from 'launchdarkly-react-client-sdk'

/*
  productTestFlagGazebo2272022 is the flag id from LaunchDarkly.
  The best practice for feature flags is long verbose id's, in a real
  flag I would do something like:
    <product><name of flag><repo><date created>
  Will write more in confluence.

  The LaunchDarkly enviornment used is based on the enviornment variable in
  the env files. By default there is none configured so gazebo builds
  for self hosted.

  * Note: Gazebo runs on the Dashboard project in LaunchDarkly.

  To set up flags locally, you need to add REACT_APP_LAUNCHDARKLY to
  `.env.local` with the enviornments Client-Side-ID. 

  You can use the preview deploy enviornment or create your own.
  I've create myown personal enviornment called Terry.

  * Note: More enviornments means settup up flags in more places. We can
          clone flags to other envs but once cloned we need to maintain them
          manually.

  You can create your own here:
  https://app.launchdarkly.com/settings/projects


  Boolean values aren't ideal for long running feature flags so I've used a string
  Conditionally checking if the value 'isVisable' to not render in the Launch Darkly
  production enviornment. 

*/
const ExampleFlag = ({ provider }) => {
  const { productTestFlagGazebo2272022 } = useFlags()
  /* 
    Note! productTestFlagGazebo2272022 variation "Don't show in UI"'s 
    value is still isVisible in code. A good example of labeling for human's
    from the dashboard but in code the variations value is only provided.
  */
  return (
    productTestFlagGazebo2272022 !== 'isVisible' && (
      <p>
        Flagged component: {productTestFlagGazebo2272022} on {provider}
      </p>
    )
  )
}

ExampleFlag.propTypes = {
  provider: PropTypes.string,
}

export default ExampleFlag
