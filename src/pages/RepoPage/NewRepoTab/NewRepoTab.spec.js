import { repoPageRender, screen } from '../repo-jest-setup'

import { useRepo } from 'services/repo'
import NewTab from '.'

jest.mock('services/repo/hooks')

describe('New Page', () => {
  function setup(data) {
    useRepo.mockReturnValue({ data })

    repoPageRender({
      initialEntries: ['/gh/codecov/Test/new'],
      renderNew: () => <NewTab />,
    })
  }

  describe('when rendered with token and repo is private', () => {
    beforeEach(() => {
      setup({ repository: { uploadToken: 'randomToken', private: true } })
    })

    it('renders Step1', () => {
      const step = screen.getByText(/Step 1/)
      expect(step).toBeInTheDocument()
    })

    it('renders Step2', () => {
      const step = screen.getByText(/Step 2/)
      expect(step).toBeInTheDocument()
    })

    it('renders the passed token', () => {
      const token = screen.getByText(/randomToken/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('when rendered with token and repo is public and user is part of org', () => {
    beforeEach(() => {
      setup({
        repository: { uploadToken: 'randomToken', private: false },
        isPartOfOrg: true,
      })
    })

    it('renders Step1', () => {
      const step = screen.getByText(/Step 1/)
      expect(step).toBeInTheDocument()
    })

    it('renders Step2', () => {
      const step = screen.getByText(/Step 2/)
      expect(step).toBeInTheDocument()
    })

    it('renders the passed token', () => {
      const token = screen.getByText(/randomToken/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('when rendered with public repo and user is not a part of the org', () => {
    beforeEach(() => {
      setup({
        repository: { uploadToken: 'randomToken', private: false },
        isPartOfOrg: false,
      })
    })

    it('renders Step1', () => {
      const step = screen.queryByText(/Step 1/)
      expect(step).toBeInTheDocument()
    })

    it('renders Step2', () => {
      const step = screen.getByText(/Step 2/)
      expect(step).toBeInTheDocument()
    })

    it('does not render the token', () => {
      const token = screen.queryByText(/randomToken/)
      expect(token).not.toBeInTheDocument()
    })
  })

  describe('when rendered with no data', () => {
    beforeEach(() => {
      setup()
    })

    it('does not render Steps', () => {
      const step = screen.queryByText(/Step 1/)
      expect(step).not.toBeInTheDocument()
    })
  })

  describe('when repo is private', () => {
    beforeEach(() => {
      setup({
        repository: { uploadToken: 'randomToken', private: true },
      })
    })

    it('renders github config banner', () => {
      const bannerTitle = screen.queryByText(/Install Codecov GitHub app/)
      expect(bannerTitle).toBeInTheDocument()
    })
  })

  describe('when repo is public', () => {
    beforeEach(() => {
      setup({
        repository: { uploadToken: 'randomToken', private: false },
      })
    })

    it('does not render github config banner', () => {
      const bannerTitle = screen.queryByText(/Install Codecov GitHub app/)
      expect(bannerTitle).not.toBeInTheDocument()
    })
  })
})
