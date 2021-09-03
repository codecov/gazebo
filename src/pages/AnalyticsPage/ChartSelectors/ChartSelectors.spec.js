import { render, screen } from '@testing-library/react'
import ChartSelectors from './ChartSelectors'
import { subDays } from 'date-fns'
import { useRepos } from 'services/repos/hooks'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('services/repos/hooks')
jest.mock('ui/Multiselect', () => () => 'Multiselect')
jest.mock('ui/Datepicker', () => () => 'Datepicker')

describe('AnalyticsPage', () => {
  let props
  function setup({ params, owner, active, sortItem, updateParams }, repos) {
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
    render(
      <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
        <Route path="/analytics/:provider/:owner">
          <ChartSelectors {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when the owner exists', () => {
    beforeEach(() => {
      setup(
        {
          params: {
            search: 'Repo name 1',
          },
          updateParams: () => {},
          owner: 'bob',
          active: true,
          sortItem: {
            ordering: 'NAME',
            direction: 'ASC',
          },
        },
        [
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
        ]
      )
    })

    it('renders the datepicker', () => {
      expect(screen.getByText(/Datepicker/)).toBeInTheDocument()
    })

    it('renders the multiselect', () => {
      expect(screen.getByText(/Multiselect/)).toBeInTheDocument()
    })
  })
})
