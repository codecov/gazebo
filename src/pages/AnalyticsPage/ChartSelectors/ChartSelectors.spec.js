import { render, screen, fireEvent } from '@testing-library/react'
import ChartSelectors from './ChartSelectors'
import { subDays } from 'date-fns'
import { useRepos } from 'services/repos/hooks'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('services/repos/hooks')
jest.mock('ui/Datepicker', () => () => 'Datepicker')

describe('AnalyticsPage', () => {
  let props
  let wrapper
  function setup({ params, owner, active, sortItem, updateParams }) {
    const { repos } = params
    useRepos.mockReturnValue({
      data: {
        repos,
      },
    })
    props = {
      active,
      owner,
      sortItem,
      params,
      updateParams,
    }
    wrapper = render(
      <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
        <Route path="/analytics/:provider/:owner">
          <ChartSelectors {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when the owner exists', () => {
    beforeEach(() => {
      setup({
        params: {
          search: 'Repo name 1',
          repos: [
            {
              private: false,
              author: {
                username: 'owner1',
              },
              name: 'Repo name 1',
              latestCommitAt: subDays(new Date(), 3),
              coverage: 43,
              active: true,
            },
            {
              private: false,
              author: {
                username: 'owner2',
              },
              name: 'Repo name 3',
              latestCommitAt: subDays(new Date(), 4),
              coverage: 35,
              active: false,
            },
          ],
        },
        updateParams: () => {},
        owner: 'bob',
        active: true,
        sortItem: {
          ordering: 'NAME',
          direction: 'ASC',
        },
      })
    })

    it('renders the datepicker', () => {
      expect(screen.getByText(/Datepicker/)).toBeInTheDocument()
    })

    it('renders the MultiSelect', () => {
      expect(screen.getByText(/2 Repos selected/)).toBeInTheDocument()
    })

    it('triggers the onChange when clicked', () => {
      const button = wrapper.getByRole('button')
      fireEvent.click(button)
      const allRepos = screen.getAllByRole('option')[0]
      fireEvent.click(allRepos)
      expect(screen.queryByText(/2 Repos selected/)).not.toBeInTheDocument()
      expect(screen.queryByText(/All Repos/)).toBeInTheDocument()
    })
  })
})
