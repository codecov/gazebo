import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Title from '.'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { QueryClientProvider, QueryClient } from 'react-query'

jest.mock('services/repo/hooks')

describe('Title', () => {
  const author = { username: 'RulaKhaled' }
  const pullId = 746
  const title = 'Test1'
  const updatestamp = '2021-08-30T19:33:49.819672'

  function setup() {
    const queryClient = new QueryClient()

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Title
            author={author}
            pullId={pullId}
            title={title}
            updatestamp={updatestamp}
          />
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders pull title', () => {
      const text = screen.getByText(/Test1/)
      expect(text).toBeInTheDocument()
    })

    it('renders pull author', () => {
      const author1 = screen.getByText(/RulaKhaled/)
      expect(author1).toBeInTheDocument()
    })

    it('renders pull updatestamp', () => {
      const dt = formatDistanceToNow(new Date('2021-08-30T19:33:49.819672'), {
        addSuffix: true,
      })
      const dt1 = screen.getByText('opened ' + dt)
      expect(dt1).toBeInTheDocument()
    })
  })
})
