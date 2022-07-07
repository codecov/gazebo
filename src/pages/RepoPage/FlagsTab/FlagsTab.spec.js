import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import FlagsTab from './FlagsTab'

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
    })
  })
})
