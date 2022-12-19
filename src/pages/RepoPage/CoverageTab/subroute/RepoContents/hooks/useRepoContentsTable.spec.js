import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { useParams } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useLocationParams } from 'services/navigation'
import { useRepoBranchContents, useRepoOverview } from 'services/repo'

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
  data: {
    results: [
      {
        name: 'flag2',
        filepath: '',
        percentCovered: 92.78,
        __typename: 'PathContentDir',
        hits: 4,
        misses: 2,
        lines: 7,
        partials: 1,
      },
    ],
  },
  isLoading: false,
}

const manyFilesAndDirsMock = {
  data: {
    results: [
      {
        name: 'flag2',
        filepath: 'flag2',
        percentCovered: 92.78,
        __typename: 'PathContentFile',
        hits: 4,
        misses: 2,
        lines: 7,
        partials: 1,
      },
      {
        name: 'flag',
        filepath: 'subfolder/folder/flag1',
        percentCovered: 92.78,
        __typename: 'PathContentFile',
        hits: 2,
        misses: 5,
        lines: 6,
        partials: 1,
      },
      {
        name: 'flag3',
        filepath: 'a/b/c/d/e/f/g/flag3',
        percentCovered: 92.78,
        __typename: 'PathContentFile',
        hits: 4,
        misses: 2,
        lines: 7,
        partials: 1,
      },
    ],
  },
  isLoading: false,
}

const bigArray = new Array(26).fill({
  name: 'flag2',
  filepath: 'flag2',
  percentCovered: 92.78,
  __typename: 'PathContentFile',
  hits: 4,
  misses: 2,
  lines: 7,
  partials: 1,
})

const manyFilesMock = {
  data: { results: bigArray },
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
  function setup({ repoData, useParamsValue, paramPath = false }) {
    useParams.mockReturnValue({
      owner: 'Rabee-AbuBaker',
      provider: 'gh',
      repo: 'another-test',
      branch: 'main',
      ...(paramPath && { path: 'filePath' }),
    })

    useRepoBranchContents.mockReturnValue(repoData)
    useRepoOverview.mockReturnValue(useRepoOverviewMock)
    useLocationParams.mockReturnValue({
      params: useParamsValue,
    })

    hookData = renderHook(() => useRepoContentsTable())
  }

  it('returns data accordingly', () => {
    setup({ repoData: repoContentsMock })

    expect(hookData.result.current.data.length).toEqual(1)
    expect(hookData.result.current.headers.length).toEqual(6)
    expect(hookData.result.current.isLoading).toEqual(false)
  })

  it('renders the correct headers', async () => {
    expect(hookData.result.current.headers[0].header).toStrictEqual('Files')
    expect(hookData.result.current.headers[5].header).toStrictEqual(
      'Coverage %'
    )
  })

  describe('when there is a file path', () => {
    it('includes .. link', () => {
      setup({ repoData: repoContentsMock, paramPath: true })

      expect(hookData.result.current.data.length).toEqual(2)
    })
  })

  describe('when there is no data', () => {
    it('returns an empty array', () => {
      setup({ repoData: emptyRepoContentsMock })
      expect(hookData.result.current.data).toEqual([])
    })
  })

  describe('when there is search param', () => {
    it('calls useRepoBranchContents with correct filters value', () => {
      setup({
        repoData: repoContentsMock,
        useParamsValue: { search: 'file.js' },
      })

      expect(hookData.result.current.isSearching).toEqual(true)
      expect(useRepoBranchContents).toHaveBeenCalledWith({
        branch: 'main',
        filters: { searchValue: 'file.js' },
        owner: 'Rabee-AbuBaker',
        path: '',
        provider: 'gh',
        repo: 'another-test',
        suspense: false,
      })
    })
  })

  describe('when there is list param', () => {
    it('calls useRepoBranchContents with correct filters value', () => {
      setup({
        repoData: manyFilesAndDirsMock,
        useParamsValue: { displayType: 'list' },
      })

      expect(hookData.result.current.data.length).toBe(3)
      expect(useRepoBranchContents).toHaveBeenCalledWith({
        branch: 'main',
        filters: { displayType: 'LIST' },
        owner: 'Rabee-AbuBaker',
        path: '',
        provider: 'gh',
        repo: 'another-test',
        suspense: false,
      })
    })
  })

  describe('when handleSort is triggered', () => {
    it('calls useRepoBranchContents with correct filters value', async () => {
      setup({
        repoData: repoContentsMock,
      })

      act(() => {
        hookData.result.current.handleSort([{ desc: false, id: 'name' }])
      })

      await waitFor(() =>
        expect(useRepoBranchContents).toHaveBeenCalledWith({
          branch: 'main',
          filters: { ordering: { direction: 'ASC', parameter: 'NAME' } },
          owner: 'Rabee-AbuBaker',
          path: '',
          provider: 'gh',
          repo: 'another-test',
          suspense: false,
        })
      )

      act(() => {
        hookData.result.current.handleSort([{ desc: true, id: 'coverage' }])
      })

      await waitFor(() =>
        expect(useRepoBranchContents).toHaveBeenCalledWith({
          branch: 'main',
          filters: { ordering: { direction: 'DESC', parameter: 'COVERAGE' } },
          owner: 'Rabee-AbuBaker',
          path: '',
          provider: 'gh',
          repo: 'another-test',
          suspense: false,
        })
      )
    })
  })

  describe('when handlePaginationClick is triggered', () => {
    it('renders the correct amount of data', async () => {
      setup({
        repoData: manyFilesMock,
      })

      act(() => {
        hookData.result.current.handlePaginationClick()
      })

      expect(hookData.result.current.data).toHaveLength(26)
    })
  })
})
