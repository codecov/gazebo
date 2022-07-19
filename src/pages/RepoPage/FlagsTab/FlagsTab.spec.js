import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import FlagsTab from './FlagsTab'

jest.mock('./BackfillBanner/BackfillBanner.js', () => () => 'Backfill Banner')

describe('Flags Tab', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
        <Route path="/:provider/:owner/:repo/flags" exact={true}>
          <FlagsTab />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders header and table components', () => {
      expect(screen.getByText(/Flags Header Component/)).toBeInTheDocument()
      expect(screen.getByText(/Flags table/)).toBeInTheDocument()
      expect(screen.getByText(/Backfill Banner/)).toBeInTheDocument()
    })
  })
})
