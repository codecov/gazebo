import { Suspense, lazy } from 'react'
import config from 'config'

export default function ExampleFlagMain() {
  let ExampleFlag
  if (config.LAUNCHDARKLY) {
    ExampleFlag = lazy(() =>
      import('./flags/product-test-flag-gazebo-22-7-2022')
    )
  } else {
    ExampleFlag = lazy(() => import('./ExampleFlag'))
  }

  return (
    <Suspense fallback={null}>
      <ExampleFlag />
    </Suspense>
  )
}
