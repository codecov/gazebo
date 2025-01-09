import { Alert } from 'ui/Alert'

export const CachedBundleContentBanner = () => {
  return (
    <Alert variant="info">
      <Alert.Description>
        The reported bundle size includes cached data from previous commits
      </Alert.Description>
    </Alert>
  )
}
