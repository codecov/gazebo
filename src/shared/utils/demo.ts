import { ReposQueryOpts } from 'services/repos/ReposQueryOpts'

import { ExtractInfiniteQueryDataType } from './queries'

export const DEMO_REPO = {
  provider: 'github',
  owner: 'codecov',
  repo: 'gazebo',
  displayName: 'Codecov demo',
}

type ReposQueryData = ExtractInfiniteQueryDataType<typeof ReposQueryOpts>

export function formatDemoRepos(
  demoReposData: ReposQueryData | undefined,
  searchValue: string
) {
  if (!demoReposData) {
    return []
  }

  return demoReposData?.pages
    .flatMap((page) => page.repos)
    .filter(isNotNull)
    .map(
      // tag the repo as demo and overwrite its display name
      (repo) => ({
        ...repo,
        isDemo: true,
        name: DEMO_REPO.displayName,
      })
    )
    .filter(
      // filter if name does not match the search value
      (repo: { name: string }) =>
        !searchValue ||
        repo.name.toLowerCase().includes(searchValue.toLowerCase())
    )
}

// isNotNull can be used in filter to exclude null elements while conveying to
// the type system that we're filtering nullable elements to non-nullable elements
export function isNotNull<T>(x: T): x is NonNullable<T> {
  return x != null
}
