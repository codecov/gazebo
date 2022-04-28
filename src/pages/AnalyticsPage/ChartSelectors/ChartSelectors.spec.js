import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { subDays } from 'date-fns'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepos } from 'services/repos/hooks'

import ChartSelectors from './ChartSelectors'

jest.mock('services/repos/hooks')

describe('ChartSelectors', () => {
  let props
  function setup({ params, owner, active, sortItem, updateParams }) {
    const { repositories } = params
    useRepos.mockReturnValue({
      data: {
        repos: repositories,
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
      setup({
        params: {
          search: 'Repo name 1',
          repositories: [
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
        updateParams: jest.fn(),
        owner: 'bob',
        active: true,
        sortItem: {
          ordering: 'NAME',
          direction: 'ASC',
        },
      })
    })

    describe('changing the date updates the selected dates', () => {
      it('assert the start date can be set', async () => {
        expect(window.location.search).toBe('')

        const picker = screen.getByRole('textbox')
        fireEvent.click(picker)

        const theThird = screen.getByRole('option', {
          name: 'Choose Sunday, April 3rd, 2022',
        })
        fireEvent.click(theThird)

        await waitFor(() => expect(picker.value).toBe('04/03/2022 - '))
      })
    })

    it('renders the MultiSelect', () => {
      expect(screen.getByText(/2 Repos selected/)).toBeInTheDocument()
    })

    it('triggers the multiselect onChange when clicked', () => {
      const button = screen.getByRole('button', {
        name: 'Select repos to choose',
      })
      fireEvent.click(button)
      const allRepos = screen.getAllByRole('option')[0]
      fireEvent.click(allRepos)
      expect(screen.queryByText(/2 Repos selected/)).not.toBeInTheDocument()
      expect(screen.getByText(/All Repos/)).toBeInTheDocument()
    })

    it('clears filters when clear filters button is clicked', () => {
      const button = screen.getByRole('button', { name: 'Clear filters' })
      fireEvent.click(button)
      expect(props.updateParams).toHaveBeenCalledWith({
        endDate: null,
        repositories: [],
        startDate: null,
      })
    })
  })
})
