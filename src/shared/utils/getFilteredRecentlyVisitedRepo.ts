import { Repository } from 'services/repos/ReposTeamQueryOpts'

import { isNotNull } from './demo'
import { transformStringToLocalStorageKey } from './transformStringToLocalStorageKey'

// returns the recently visited repo if it matches the search value
export function getFilteredRecentlyVisitedRepo(
  recentlyVisitedReposData: Repository[] | undefined,
  searchValue: string,
  owner: string
) {
  const recentlyVisitedRepoName = localStorage.getItem(
    `${transformStringToLocalStorageKey(owner)}_recently_visited`
  )

  if (!recentlyVisitedReposData || !recentlyVisitedRepoName) {
    return null
  }

  const repos = (recentlyVisitedReposData ?? []).filter(isNotNull).filter(
    // filter if name does not match the search value
    (repo: { name: string }) =>
      !searchValue ||
      repo.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  return repos?.length ? repos[0] : null
}
