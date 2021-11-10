import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Title from '.'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

jest.mock('services/repo/hooks')

describe('Title', () => {
  const pull = {
    author: { username: 'RulaKhaled' },
    compareWithBase: {
      patchTotals: {
        coverage: 90,
      },
    },
    head: {
      totals: {
        coverage: 45,
      },
    },
    pullId: 746,
    state: 'MERGED',
    title: 'Test1',
    updatestamp: '2021-08-30T19:33:49.819672',
  }

  const ownerData = {
    avatarUrl: 'rula/hh',
    isCurrentUserPartOfOrg: true,
    username: 'rula',
  }

  function setup() {
    render(
      <MemoryRouter>
        <Title pull={pull} ownerData={ownerData} />
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
