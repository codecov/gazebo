import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useImage } from 'services/image'
import { formatTimeToNow } from 'shared/utils/dates'

import Title from '.'

jest.mock('services/image')
jest.mock('services/user')
jest.mock('services/repo')

describe('Title', () => {
  function setup({ author, commitid, message, createdAt }) {
    const queryClient = new QueryClient()
    useImage.mockReturnValue({ src: 'imageUrl', isLoading: false, error: null })

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Title
            message={message}
            author={author}
            commitid={commitid}
            createdAt={createdAt}
          />
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        author: { username: 'RulaKhaled', avatarUrl: 'random' },
        commitid: 'id',
        message: 'Test1',
        createdAt: '2021-08-30T19:33:49.819672',
      })
    })

    it('renders commit title', () => {
      const text = screen.getByText(/Test1/)
      expect(text).toBeInTheDocument()
    })

    it('renders commit author', () => {
      const author1 = screen.getByText(/RulaKhaled/)
      expect(author1).toBeInTheDocument()
    })

    it('renders commit updatestamp', () => {
      const dt = formatTimeToNow('2021-08-30T19:33:49.819672')
      const dt1 = screen.getByText('opened ' + dt)
      expect(dt1).toBeInTheDocument()
    })
  })

  describe('when rendered with no owner data', () => {
    beforeEach(() => {
      setup({
        author: null,
        commitid: 'id',
        message: 'Test1',
        createdAt: '2021-08-30T19:33:49.819672',
      })
    })

    it('renders commit title', () => {
      const text = screen.queryByText(/Test1/)
      expect(text).toBeInTheDocument()
    })

    it('renders commit updatestamp', () => {
      const dt = formatTimeToNow('2021-08-30T19:33:49.819672')
      const dt1 = screen.queryByText('opened ' + dt)
      expect(dt1).toBeInTheDocument()
    })

    it('renders default avatar', () => {
      const avatar = screen.getByRole('img', { alt: 'avatar' })
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('when rendered with message longer than 50', () => {
    beforeEach(() => {
      setup({
        author: { username: 'RulaKhaled', avatarUrl: 'random' },
        commitid: 'id',
        message: 'Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1',
        createdAt: '2021-08-30T19:33:49.819672',
      })
    })

    it('renders commit title with 3 dots', () => {
      const text = screen.queryByText(
        /Test1Test1Test1Test1Test1Test1Test1Test1.../
      )
      expect(text).toBeInTheDocument()
    })
  })

  describe('when rendered with no commit message', () => {
    beforeEach(() => {
      setup({
        author: { username: 'RulaKhaled', avatarUrl: 'random' },
        commitid: 'id',
        message: null,
        createdAt: '2021-08-30T19:33:49.819672',
      })
    })

    it('renders commit default message', () => {
      const text = screen.queryByText('commit message unavailable')
      expect(text).toBeInTheDocument()
    })
  })
})
