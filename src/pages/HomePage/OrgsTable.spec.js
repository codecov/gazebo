import { render, screen } from '@testing-library/react'
import { subDays } from 'date-fns'
import OrgsTable from './OrgsTable'

describe('OrgsTable', () => {
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
        },
        {
          private: true,
          author: {
            username: 'owner1',
          },
          name: 'Repo name 2',
          updatedAt: subDays(new Date(), 2),
          coverage: 100,
        },
        {
          private: true,
          author: {
            username: 'owner1',
          },
          name: 'Repo name 3',
          updatedAt: subDays(new Date(), 5),
          coverage: 0,
        },
      ],
    }

    const _props = { ...props, ...data }
    render(<OrgsTable {..._props} />)
  }

  describe('when rendering OrgsTable', () => {
    beforeEach(() => {
      setup()
    })

    describe('renders sessions first column', () => {
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

        expect(bars.length).toBe(3)
      })
    })
  })
})
