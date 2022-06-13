import { renderHook } from '@testing-library/react-hooks'
import { useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import { useRepoContents } from 'services/repoContents/hooks'

import { useRepoContentsTable } from './useRepoContentsTable'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))
jest.mock('services/repoContents/hooks')
jest.mock('services/repo')

const repoContentsMock = {
  data: [
    {
      name: 'flag2',
      filepath: '',
      percentCovered: 92.78,
      type: 'dir',
    },
  ],
  isLoading: false,
}

const emptyRepoContentsMock = {
  data: [],
  isLoading: false,
}

const useRepoOverviewMock = {
  data: {
    defaultBranch: 'main',
    private: true,
  },
  isLoading: false,
}

describe('useRepoContentsTable', () => {
  let hookData

  function setup(repoData) {
    useParams.mockReturnValue({
      owner: 'Rabee-AbuBaker',
      provider: 'gh',
      repo: 'another-test',
      branch: 'main',
      path: '',
    })
    useRepoContents.mockReturnValue(repoData)
    useRepoOverview.mockReturnValue(useRepoOverviewMock)

    hookData = renderHook(() => useRepoContentsTable())
  }

  it('returns data accordingly', () => {
    setup(repoContentsMock)
    expect(hookData.result.current.data.length).toEqual(1)
    expect(hookData.result.current.headers.length).toEqual(2)
    expect(hookData.result.current.isLoading).toEqual(false)
  })

  describe('when there is no data', () => {
    it('returns an empty array', () => {
      setup(emptyRepoContentsMock)
      expect(hookData.result.current.data).toEqual([])
    })
  })
})
