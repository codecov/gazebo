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
  let originalLocation

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
      originalLocation = window.location
      delete window.location
      window.location = {
        href: 'http://CRRocks.com/gh/codecov/Test/new',
        pathname: '/gh/codecov/Test/new',
      }

      setup({
        repoData: {
          repository: { uploadToken: 'randomToken', private: false },
          isCurrentUserPartOfOrg: false,
        },
      })
    })

    afterEach(() => {
      window.location = originalLocation
    })

    it('redirects to vue', () => {
      expect(window.location.pathname).toBe('/gh/codecov/Test')
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
      originalLocation = window.location
      delete window.location
      window.location = {
        href: 'http://CRRocks.com/gh/codecov/Test/new',
        pathname: '/gh/codecov/Test/new',
      }

      setup({
        repoData: {
          repository: { uploadToken: 'randomToken', private: false },
        },
        commitsData: [{}, {}, {}],
      })
    })

    afterEach(() => {
      window.location = originalLocation
    })

    it('redirects to vue', () => {
      expect(window.location.pathname).toBe('/gh/codecov/Test')
    })
  })

  describe('repo is missing a token', () => {
    beforeEach(() => {
      originalLocation = window.location
      delete window.location
      window.location = {
        href: 'http://CRRocks.com/gh/codecov/Test/new',
        pathname: '/gh/codecov/Test/new',
      }

      setup({
        repoData: {
          repository: { private: false },
        },
      })
    })

    afterEach(() => {
      window.location = originalLocation
    })

    it('redirects to vue', () => {
      expect(window.location.pathname).toBe('/gh/codecov/Test')
    })
  })
})
