/*
  Example use:

  import { useFlags } from 'shared/FeatureFlags

  const { productTestFlagGazebo2272022 } = useFlags({
    productTestFlagGazebo2272022: 'test',
  })

  Note: Passed object is the returned value if in self hosted mode.
  It is an object because you can get multiple flags.
*/

export * from './featureFlag'
