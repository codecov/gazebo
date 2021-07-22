import { Suspense, lazy } from 'react'
import config from 'config'

export default function RenderTextMain() {
  let RenderText
  if (config.LAUNCHDARKLY) {
    RenderText = lazy(() =>
      import('./flags/product-test-flag-gazebo-22-7-2022')
    )
  } else {
    RenderText = lazy(() => import('./RenderText'))
  }

  return (
    <Suspense fallback={null}>
      <RenderText />
    </Suspense>
  )
}
