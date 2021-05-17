import { render, screen } from '@testing-library/react'
import { subDays } from 'date-fns'
import ActiveReposTable from './ActiveReposTable'

describe('ActiveReposTable', () => {
  function setup(props) {
    const data = {
      repos: [
        {
          private: false,
          author: {
            username: 'owner1',
          },
          name: 'Repo name 1',
          updatedAt: subDays(new Date(), 3),
          coverage: 43,
          active: true,
        },
        {
          private: true,
          author: {
            username: 'owner1',
          },
          name: 'Repo name 2',
          updatedAt: subDays(new Date(), 2),
          coverage: 100,
          active: true,
        },
        {
          private: true,
          author: {
            username: 'owner1',
          },
          name: 'Repo name 3',
          updatedAt: subDays(new Date(), 5),
          active: true,
        },
      ],
    }

    const _props = { ...props, ...data }
    render(<ActiveReposTable {..._props} />)
  }

  describe('when rendering OrgsTable', () => {
    beforeEach(() => {
      setup()
    })

    describe('renders table', () => {
      it('renders table repo name', () => {
        const buttons = screen.getAllByText(/Repo name/)
        expect(buttons.length).toBe(3)
      })
      it('renders second column', () => {
        const lastseen1 = screen.getByText(/3 days/)
        const lastseen2 = screen.getByText(/2 days/)
        const lastseen3 = screen.getByText(/5 days/)
        expect(lastseen1).toBeInTheDocument()
        expect(lastseen2).toBeInTheDocument()
        expect(lastseen3).toBeInTheDocument()
      })
      it('renders third column', () => {
        const bars = screen.getAllByTestId('org-progress-bar')

        expect(bars.length).toBe(2)
      })
      it('renders handles null coverage', () => {
        const noData = screen.getByText(/No data available/)
        expect(noData).toBeInTheDocument()
      })
    })
  })
})
