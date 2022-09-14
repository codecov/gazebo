import NewRepoGithubContent from './NewRepoGithubContent'

import { repoPageRender, screen } from '../repo-jest-setup'

describe('New Repo Tab Github Content', () => {
  function setup() {
    repoPageRender({
      initialEntries: ['/gh/codecov/Test/new'],
      renderNew: () => <NewRepoGithubContent />,
    })
  }

  describe('renders after completion list', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the title', () => {
      const title = screen.getByText(
        /After completing the three steps in this guide/
      )
      expect(title).toBeInTheDocument()
    })

    it('renders list bullets', () => {
      const li = screen.getByText(/integrated Codecov/)
      expect(li).toBeInTheDocument()
    })
  })

  describe('renders prerequisites list', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the title', () => {
      const title = screen.getByText(/Prerequisites/)
      expect(title).toBeInTheDocument()
    })

    it('renders list bullets - CI provider workflow link', () => {
      const ciProviderLink = screen.getByRole('link', {
        name: /CI provider workflow/i,
      })
      expect(ciProviderLink).toBeInTheDocument()
      expect(ciProviderLink).toHaveAttribute(
        'href',
        'https://circleci.com/blog/what-is-continuous-integration'
      )
    })
  })

  describe('renders resources list', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the title', () => {
      const title = screen.getByText(/Resources/)
      expect(title).toBeInTheDocument()
    })

    it('renders list bullets - CI provider workflow link', () => {
      const ciProviderLink = screen.getByRole('link', {
        name: /Quick start guide/,
      })
      expect(ciProviderLink).toBeInTheDocument()
      expect(ciProviderLink).toHaveAttribute('href', 'https://docs.codecov.io/')
    })
  })
})
