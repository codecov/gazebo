import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { useParams } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useLocationParams } from 'services/navigation'
import { useRepoContents, useRepoOverview } from 'services/repo'

import useRepoContentsTable from './useRepoContentsTable'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))
jest.mock('services/repo')
jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

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
  const updateParams = jest.fn()
  function setup({ repoData, useParamsValue }) {
    useParams.mockReturnValue({
      owner: 'Rabee-AbuBaker',
      provider: 'gh',
      repo: 'another-test',
      branch: 'main',
      path: '',
    })

    useRepoContents.mockReturnValue(repoData)
    useRepoOverview.mockReturnValue(useRepoOverviewMock)
    useLocationParams.mockReturnValue({
      params: useParamsValue,
      updateParams,
    })

    hookData = renderHook(() => useRepoContentsTable())
  }

  it('returns data accordingly', () => {
    setup({ repoData: repoContentsMock })
    expect(hookData.result.current.data.length).toEqual(1)
    expect(hookData.result.current.headers.length).toEqual(2)
    expect(hookData.result.current.isLoading).toEqual(false)
  })

  describe('when there is no data', () => {
    it('returns an empty array', () => {
      setup({ repoData: emptyRepoContentsMock })
      expect(hookData.result.current.data).toEqual([])
    })
  })

  describe('when there is search param', () => {
    it('calls useRepoContents with correct filters value', () => {
      setup({
        repoData: repoContentsMock,
        useParamsValue: { search: 'file.js' },
      })

      expect(hookData.result.current.isSearching).toEqual(true)
      expect(useRepoContents).toHaveBeenCalledWith({
        branch: 'main',
        filters: { searchValue: 'file.js' },
        owner: 'Rabee-AbuBaker',
        path: '',
        provider: 'gh',
        repo: 'another-test',
      })
    })
  })

  describe('when handleSort is triggered', () => {
    it('calls useRepoContents with correct filters value', async () => {
      setup({
        repoData: repoContentsMock,
      })

      act(() => {
        hookData.result.current.handleSort([{ desc: false, id: 'name' }])
      })

      await waitFor(() =>
        expect(useRepoContents).toHaveBeenCalledWith({
          branch: 'main',
          filters: { ordering: { direction: 'ASC', parameter: 'NAME' } },
          owner: 'Rabee-AbuBaker',
          path: '',
          provider: 'gh',
          repo: 'another-test',
        })
      )

      act(() => {
        hookData.result.current.handleSort([{ desc: true, id: 'coverage' }])
      })

      await waitFor(() =>
        expect(useRepoContents).toHaveBeenCalledWith({
          branch: 'main',
          filters: { ordering: { direction: 'DESC', parameter: 'COVERAGE' } },
          owner: 'Rabee-AbuBaker',
          path: '',
          provider: 'gh',
          repo: 'another-test',
        })
      )
    })
  })
})
