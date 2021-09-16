import { Suspense, lazy } from 'react'
import config from 'config'

/*
  This is an example flag enabled react component. It should contain ONLY
  the conditional logic to load either the permament code or the flagged
  code.

  If we could abstract this conditional loader abd test that would be amazing. 

  This conditional entry point is needed to handle self hosted builds.
*/
export default function FlagLoader(props) {
  let Component

  if (config.LAUNCHDARKLY) {
    Component = lazy(() =>
      /*
        Folder name matches flag id in LD dashboard. This will help
        for cleaning up / decommisioning flags.

        Flag is nested in a "flags" folder to be clear in the folder structure
        that this is section contains flagged logic.
      */
      import('./flags/product-test-flag-gazebo-22-7-2022')
    )
  } else {
    /* 
      This is the permement often original code.
      It is used for self hosted builds.

      Should be fully tested.
    */
    Component = lazy(() => import('./ExampleFlag'))
  }

  return (
    <Suspense fallback={null}>
      <Component {...props} />
    </Suspense>
  )
}
