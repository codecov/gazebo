import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { useRepo } from 'services/repo'

import DeactivatedRepo from './DeactivatedRepo'

jest.mock('services/repo')

describe('DeactivatedRepo', () => {
  function setup(isPartOfRepo = true) {
    useRepo.mockReturnValue({
      data: {
        isCurrentUserPartOfOrg: isPartOfRepo,
      },
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
        <Route path="/:provider/:owner/:repo">
          <DeactivatedRepo />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when user is part of org', () => {
    beforeEach(() => {
      setup()
    })

    it('renders corresponding message', () => {
      expect(
        screen.getByText(/To reactivate the repo go to/)
      ).toBeInTheDocument()
    })
  })

  describe('when user is not part of org', () => {
    beforeEach(() => {
      setup(false)
    })

    it('renders corresponding message', () => {
      expect(
        screen.getByText(/Contact an administrator of your git organization/)
      ).toBeInTheDocument()
    })
  })
})
