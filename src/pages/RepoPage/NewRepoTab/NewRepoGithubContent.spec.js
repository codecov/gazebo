import { useRepo } from 'services/repo'

import NewRepoGithubContent from './NewRepoGithubContent'

import { repoPageRender, screen } from '../repo-jest-setup'

jest.mock('services/repo')

describe('New Repo Tab Github Content', () => {
  function setup(uploadToken = '') {
    useRepo.mockReturnValue({
      data: { repository: { uploadToken, private: true } },
    })

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

  describe('renders step 1', () => {
    beforeEach(() => {
      setup('64543f83-c5d9-40bd-95aa-af71d7301d')
    })

    it('renders header', () => {
      const title = screen.getByText(/Step 1/)
      expect(title).toBeInTheDocument()
    })

    it('renders token', () => {
      const token = screen.getByText(
        /CODECOV_TOKEN=64543f83-c5d9-40bd-95aa-af71d7301d/
      )
      expect(token).toBeInTheDocument()
    })

    it('renders team bot banner', () => {
      const link = screen.getByRole('link', { name: /team Bot/i })
      expect(link).toBeInTheDocument()
    })
  })

  describe('renders step 2', () => {
    beforeEach(() => {
      setup()
    })

    it('renders header', () => {
      const title = screen.getByText(/Step 2/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      const body = screen.getByText(
        /To start sharing your coverage reports with Codecov/
      )
      expect(body).toBeInTheDocument()
    })

    it('renders uploader integrity check banner', () => {
      const link = screen.getByRole('link', {
        name: /integrity check the uploader/i,
      })
      expect(link).toBeInTheDocument()
    })
  })
})
