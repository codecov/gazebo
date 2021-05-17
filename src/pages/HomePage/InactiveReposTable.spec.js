import { render, screen } from '@testing-library/react'
import { subDays } from 'date-fns'
import InactiveReposTable from './InactiveReposTable'

describe('InactiveReposTable', () => {
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
          active: false,
        },
        {
          private: true,
          author: {
            username: 'owner1',
          },
          name: 'Repo name 2',
          updatedAt: subDays(new Date(), 2),
          coverage: 100,
          active: false,
        },
        {
          private: true,
          author: {
            username: 'owner1',
          },
          name: 'Repo name 3',
          updatedAt: subDays(new Date(), 5),
          coverage: 0,
          active: false,
        },
      ],
    }

    const _props = { ...props, ...data }
    render(<InactiveReposTable {..._props} />)
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
        const notActiveRepos = screen.getAllByText(/Not yet enabled setup repo/)
        expect(notActiveRepos.length).toBe(3)
      })
    })
  })
})
