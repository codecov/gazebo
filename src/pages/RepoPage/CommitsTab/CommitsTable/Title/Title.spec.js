import { render, screen } from '@testing-library/react'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter } from 'react-router-dom'

import Title from '.'

jest.mock('services/repo/hooks')
jest.mock('services/user/hooks')

describe('Title', () => {
  function setup({ author, commitid, message, createdAt }) {
    const queryClient = new QueryClient()

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
      const dt = formatDistanceToNow(new Date('2021-08-30T19:33:49.819672'), {
        addSuffix: true,
      })
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
      const dt = formatDistanceToNow(new Date('2021-08-30T19:33:49.819672'), {
        addSuffix: true,
      })
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
