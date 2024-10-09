import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import ToggleHeader from 'pages/CommitDetailPage/Header/ToggleHeader/ToggleHeader'
import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import Spinner from 'ui/Spinner'
// import { ErrorBoundary } from '@sentry/react'

const FilesChangedTable = lazy(() => import('./FilesChangedTable'))
const FilesChangedTableTeam = lazy(() => import('./FilesChangedTableTeam'))

const Loader = () => (
  <div className="flex flex-1 justify-center p-4">
    <Spinner />
  </div>
)

interface URLParams {
  provider: string
  owner: string
}

function FilesChanged() {
  const { provider, owner } = useParams<URLParams>()
  const { data: repoSettings } = useRepoSettingsTeam()

  const { data: tierData } = useTier({ provider, owner })

  console.log('FILES CHANGED TAB')

  if (tierData === TierNames.TEAM && !!repoSettings?.repository?.private) {
    return (
      <Suspense fallback={<Loader />}>
        <ToggleHeader />
        <FilesChangedTableTeam />
      </Suspense>
    )
  }

  return (
    // some suspense handler here?
    // <ErrorBoundary fallback={<div>There was an error!</div>}>
    <Suspense fallback={<Loader />}>
      <ToggleHeader />
      <FilesChangedTable />
    </Suspense>
    // </ErrorBoundary>
  )
}

export default FilesChanged
