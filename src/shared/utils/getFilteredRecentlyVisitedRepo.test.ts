import { vi } from 'vitest'

import { getFilteredRecentlyVisitedRepo } from './getFilteredRecentlyVisitedRepo'
import { transformStringToLocalStorageKey } from './transformStringToLocalStorageKey'

const mockDataSingleRepo = {
  pageParams: [''],
  pages: [
    {
      pageInfo: { hasNextPage: false, endCursor: 'sample_string' },
      repos: [
        {
          name: 'repo1',
          active: false,
          activated: false,
          private: false,
          coverageAnalytics: {
            percentCovered: null,
            lines: null,
          },
          latestCommitAt: null,
          author: {
            username: 'codecov',
          },
          repositoryConfig: {
            indicationRange: {
              lowerRange: 60,
              upperRange: 80,
            },
          },
          updatedAt: null,
          coverageEnabled: null,
          bundleAnalysisEnabled: false,
        },
      ],
    },
  ],
}

const mockDataMultipleRepos = {
  pageParams: [''],
  pages: [
    {
      pageInfo: { hasNextPage: false, endCursor: 'sample_string' },
      repos: [
        {
          name: 'repo1',
          active: false,
          activated: false,
          private: false,
          coverageAnalytics: {
            percentCovered: null,
            lines: null,
          },
          latestCommitAt: null,
          author: {
            username: 'codecov',
          },
          repositoryConfig: {
            indicationRange: {
              lowerRange: 60,
              upperRange: 80,
            },
          },
          updatedAt: null,
          coverageEnabled: null,
          bundleAnalysisEnabled: false,
        },
        {
          name: 'repo2',
          active: false,
          activated: false,
          private: false,
          coverageAnalytics: {
            percentCovered: null,
            lines: null,
          },
          latestCommitAt: null,
          author: {
            username: 'codecov',
          },
          repositoryConfig: {
            indicationRange: {
              lowerRange: 40,
              upperRange: 70,
            },
          },
          updatedAt: null,
          coverageEnabled: null,
          bundleAnalysisEnabled: false,
        },
      ],
    },
  ],
}

const mockDataWithNullRepos = {
  pageParams: [''],
  pages: [
    {
      pageInfo: { hasNextPage: false, endCursor: 'sample_string' },
      repos: [
        null,
        {
          name: 'repo2',
          active: false,
          activated: false,
          private: false,
          coverageAnalytics: {
            percentCovered: null,
            lines: null,
          },
          latestCommitAt: null,
          author: {
            username: 'codecov',
          },
          repositoryConfig: {
            indicationRange: {
              lowerRange: 40,
              upperRange: 70,
            },
          },
          updatedAt: null,
          coverageEnabled: null,
          bundleAnalysisEnabled: false,
        },
      ],
    },
  ],
}

const expectedRepo1 = {
  name: 'repo1',
  active: false,
  activated: false,
  private: false,
  coverageAnalytics: {
    percentCovered: null,
    lines: null,
  },
  latestCommitAt: null,
  author: {
    username: 'codecov',
  },
  repositoryConfig: {
    indicationRange: {
      lowerRange: 60,
      upperRange: 80,
    },
  },
  updatedAt: null,
  coverageEnabled: null,
  bundleAnalysisEnabled: false,
}

describe('getFilteredRecentlyVisitedRepo', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(localStorage, 'getItem')
  })

  it('returns null when recentlyVisitedReposData is undefined', () => {
    const result = getFilteredRecentlyVisitedRepo(undefined, 'search', 'owner')
    expect(result).toBeNull()
  })

  it('returns null when no recently visited repo in localStorage', () => {
    const result = getFilteredRecentlyVisitedRepo(
      mockDataSingleRepo,
      'search',
      'owner'
    )
    expect(result).toBeNull()
  })

  it('filters repos based on search value', () => {
    const owner = 'testOwner'
    localStorage.setItem(
      `${transformStringToLocalStorageKey(owner)}_recently_visited`,
      'repo1'
    )

    const result = getFilteredRecentlyVisitedRepo(
      mockDataMultipleRepos,
      'repo1',
      owner
    )
    expect(result).toEqual(expectedRepo1)
  })

  it('returns first matching repo when multiple repos match search', () => {
    const owner = 'testOwner'
    localStorage.setItem(
      `${transformStringToLocalStorageKey(owner)}_recently_visited`,
      'repo'
    )

    const result = getFilteredRecentlyVisitedRepo(
      mockDataMultipleRepos,
      'repo',
      owner
    )
    expect(result).toEqual(expectedRepo1)
  })

  it('is case insensitive when filtering repos', () => {
    const owner = 'testOwner'
    localStorage.setItem(
      `${transformStringToLocalStorageKey(owner)}_recently_visited`,
      'RepoTest'
    )

    const result = getFilteredRecentlyVisitedRepo(
      mockDataSingleRepo,
      'Repo1',
      owner
    )
    expect(result).toEqual(expectedRepo1)
  })

  it('returns all repos when search value is empty', () => {
    const owner = 'testOwner'
    localStorage.setItem(
      `${transformStringToLocalStorageKey(owner)}_recently_visited`,
      'repo1'
    )

    const result = getFilteredRecentlyVisitedRepo(
      mockDataMultipleRepos,
      '',
      owner
    )
    expect(result).toEqual(expectedRepo1)
  })

  it('handles null repos in the data', () => {
    const owner = 'testOwner'
    localStorage.setItem(
      `${transformStringToLocalStorageKey(owner)}_recently_visited`,
      'repo1'
    )

    const result = getFilteredRecentlyVisitedRepo(
      mockDataWithNullRepos,
      'repo2',
      owner
    )
    expect(result).toEqual({
      name: 'repo2',
      active: false,
      activated: false,
      private: false,
      coverageAnalytics: {
        percentCovered: null,
        lines: null,
      },
      latestCommitAt: null,
      author: {
        username: 'codecov',
      },
      repositoryConfig: {
        indicationRange: {
          lowerRange: 40,
          upperRange: 70,
        },
      },
      updatedAt: null,
      coverageEnabled: null,
      bundleAnalysisEnabled: false,
    })
  })
})
