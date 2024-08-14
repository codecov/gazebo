import { formatDemoRepos, isNotNull } from './demo'

describe('demo related helpers', () => {
  describe('formatDemoRepos', () => {
    const demoReposData = {
      pages: [
        {
          repos: [
            {
              name: 'gazebo',
              active: true,
              activated: true,
              lines: 99,
              private: false,
              coverage: null,
              updatedAt: '2021-04-22T14:09:39.822872+00:00',
              author: {
                username: 'codecov',
              },
              repositoryConfig: {
                indicationRange: {
                  upperRange: 80,
                  lowerRange: 60,
                },
              },
              latestCommitAt: null,
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
            },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: '',
          },
        },
      ],
      pageParams: [],
    }

    it('correctly changes the display name on the data', () => {
      const formatted = formatDemoRepos(demoReposData, '')
      expect(formatted).toHaveLength(1)
      expect(formatted[0]!.name).toBe('Codecov demo')
    })

    it('correctly filters based on searchValue', () => {
      const filtered1 = formatDemoRepos(demoReposData, 'asdf')
      expect(filtered1).toHaveLength(0)

      const filtered2 = formatDemoRepos(demoReposData, 'demo')
      expect(filtered2).toHaveLength(1)
      expect(filtered2[0]!.name).toBe('Codecov demo')
    })

    it('handles when pages is nullable', () => {
      const formatted = formatDemoRepos(undefined, '')
      expect(formatted).toEqual([])
    })
  })

  describe('when using isNotNull', () => {
    it('correctly evaluates whether the argument is null or not', () => {
      expect(isNotNull(false)).toBe(true)
      expect(isNotNull(null)).toBe(false)
    })
    it('removes null and undefined items from a list when used in filter', () => {
      const myList = ['hello', null, 'world', undefined, 10]
      const filtered = myList.filter(isNotNull)
      expect(filtered).toEqual(['hello', 'world', 10])
    })
  })
})
