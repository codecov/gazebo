import { repoPageRender, screen } from '../repo-jest-setup'

import { NotFoundException } from 'shared/utils'

import { useRepo } from 'services/repo'
import { useCommits } from 'services/commits'

import NewRepoTab from '.'

jest.mock('shared/utils/exceptions')

jest.mock('services/repo/hooks')
jest.mock('services/commits/hooks')

describe('New Repo Tab', () => {
  let mockError

  afterAll(() => {
    jest.resetAllMocks()
  })

  function setup({ repoData, commitsData = [] }) {
    useRepo.mockReturnValue({ data: repoData })
    useCommits.mockReturnValue({ data: commitsData })

    mockError = jest.fn()
    const spy = jest.spyOn(console, 'error')
    spy.mockImplementation(mockError)

    repoPageRender({
      initialEntries: ['/gh/codecov/Test/new'],
      renderNew: () => <NewRepoTab />,
      renderRoot: () => <p>I redirected!</p>,
    })
  }

  describe('repo is private and user is part of org', () => {
    beforeEach(() => {
      setup({
        repoData: {
          repository: { uploadToken: 'randomToken', private: true },
          isCurrentUserPartOfOrg: true,
        },
      })
    })

    it('renders the passed token', () => {
      const token = screen.getByText(/randomToken/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('repo is public and user is part of org', () => {
    beforeEach(() => {
      setup({
        repoData: {
          repository: { uploadToken: 'randomToken', private: false },
          isCurrentUserPartOfOrg: true,
        },
      })
    })

    it('renders the passed token', () => {
      const token = screen.getByText(/randomToken/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('repo is public and user is not a part of the org', () => {
    beforeEach(() => {
      setup({
        repoData: {
          repository: { uploadToken: 'randomToken', private: false },
          isCurrentUserPartOfOrg: false,
        },
      })
    })

    it('redirects to vue', () => {
      const onRoot = screen.queryByText(/I redirected!/)
      expect(onRoot).toBeInTheDocument()
    })
  })

  describe('when repo is private and user is not a part of the org', () => {
    it('throws 404', () => {
      expect(() => {
        setup({
          repoData: {
            repository: { private: true },
            isCurrentUserPartOfOrg: false,
          },
        })
      }).toThrow(NotFoundException)
      expect(mockError).toBeCalled()
    })
  })

  describe('repo has commits', () => {
    beforeEach(() => {
      setup({
        repoData: {
          repository: { uploadToken: 'randomToken', private: false },
        },
        commitsData: [{}, {}, {}],
      })
    })

    it('redirects to vue', () => {
      const onRoot = screen.queryByText(/I redirected!/)
      expect(onRoot).toBeInTheDocument()
    })
  })

  describe('repo is missing a token', () => {
    beforeEach(() => {
      setup({
        repoData: {
          repository: { private: false },
        },
      })
    })

    it('redirects to vue', () => {
      const onRoot = screen.queryByText(/I redirected!/)
      expect(onRoot).toBeInTheDocument()
    })
  })
})
