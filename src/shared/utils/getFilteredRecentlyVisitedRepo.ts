import { ReposQueryOpts } from 'services/repos/ReposQueryOpts'
import { ReposTeamQueryOpts } from 'services/repos/ReposTeamQueryOpts'

import { isNotNull } from './demo'
import { ExtractInfiniteQueryDataType } from './queries'
import { transformStringToLocalStorageKey } from './transformStringToLocalStorageKey'

export const DEMO_REPO = {
  provider: 'github',
  owner: 'codecov',
  repo: 'gazebo',
  displayName: 'Codecov demo',
}

type ReposQueryData = ExtractInfiniteQueryDataType<typeof ReposQueryOpts>
type ReposTeamQueryData = ExtractInfiniteQueryDataType<
  typeof ReposTeamQueryOpts
>

// returns the recently visited repo if it matches the search value
export function getFilteredRecentlyVisitedRepo(
  recentlyVisitedReposData: ReposQueryData | ReposTeamQueryData | undefined,
  searchValue: string,
  owner: string
) {
  const recentlyVisitedRepoName = localStorage.getItem(
    `${transformStringToLocalStorageKey(owner)}_recently_visited`
  )

  if (!recentlyVisitedReposData || !recentlyVisitedRepoName) {
    return null
  }

  const repos = (recentlyVisitedReposData?.pages[0]?.repos ?? [])
    .filter(isNotNull)
    .filter(
      // filter if name does not match the search value
      (repo: { name: string }) =>
        !searchValue ||
        repo.name.toLowerCase().includes(searchValue.toLowerCase())
    )

  return repos?.length ? repos[0] : null
}
