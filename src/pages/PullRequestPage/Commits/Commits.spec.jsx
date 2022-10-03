import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import Commits from './Commits'
import { useCompareCommits } from './useCompareCommits'

jest.mock('./useCompareCommits.js')

const queryClient = new QueryClient()

const mockPullCommits = {
  data: [
    {
      author: 'chetney',
      message: `You're awfully nice. I mean, I could be fucking armed to the teeth. You don't know me.`,
      commitid: '1234',
      state: 'complete',
    },
    {
      author: 'laudna',
      message: `I was alive, but then I was dead, and now I'm alive again. I'm originally from Whitestone and this is Pâté, my pet rat. (as Pâté) "Hello, Chetney!"`,
      commitid: '456789',
      state: 'complete',
    },
  ],
}

describe('Commits Card', () => {
  function setup(data) {
    useCompareCommits.mockReturnValue(data)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/5']}>
          <Route path="/:provider/:owner/:repo/pull/:pullId">
            <Commits />
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('when rendered with populated data', () => {
    beforeEach(() => {
      setup(mockPullCommits)
    })

    it('renders the card title', () => {
      const commitsCardTitle = screen.getByText(/Commits/)
      expect(commitsCardTitle).toBeInTheDocument()
    })

    it('renders a card for every commit', () => {
      const commitMessage1 = screen.getByText(
        `You're awfully nice. I mean, I could be fucking armed to the teeth. You don't know me.`
      )
      expect(commitMessage1).toBeInTheDocument()
      const commitAuthor1 = screen.getByText(/chetney/)
      expect(commitAuthor1).toBeInTheDocument()

      const commitMessage2 = screen.getByText(
        `I was alive, but then I was dead, and now I'm alive again. I'm originally from Whitestone and this is Pâté, my pet rat. (as Pâté) "Hello, Chetney!"`
      )
      expect(commitMessage2).toBeInTheDocument()
      const commitAuthor2 = screen.getByText(/laudna/)
      expect(commitAuthor2).toBeInTheDocument()
    })
  })

  describe('when rendered with not commits found', () => {
    beforeEach(() => {
      setup({ data: [] })
    })

    it('renders the card title', () => {
      const commitsCardTitle = screen.getByText(/Commits/)
      expect(commitsCardTitle).toBeInTheDocument()
    })

    it('renders a card for every commit', () => {
      const notFound = screen.getByText(/no commits/)
      expect(notFound).toBeInTheDocument()
    })
  })

  describe('when commits dont have author or message', () => {
    beforeEach(() => {
      setup({
        data: [
          {
            author: null,
            message: null,
            commitid: '456789',
            state: 'complete',
          },
        ],
      })
    })

    it('renders the missing message title', () => {
      expect(screen.getByText(/Commit Title Unknown/)).toBeInTheDocument()
    })

    it('renders the missing author message', () => {
      expect(screen.getByText(/Author Unknown/)).toBeInTheDocument()
    })
  })

  describe('when commits are in error state', () => {
    beforeEach(() => {
      setup({
        data: [
          {
            author: 'Otohan Thull3',
            message:
              'Youre missing the party. Run all you want. Youre just running and leaving them to die',
            commitid: '456789',
            state: 'error',
          },
        ],
      })
    })

    it('renders the error message', () => {
      expect(screen.getByText(/processing failed/)).toBeInTheDocument()
    })
  })
})
