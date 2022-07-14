import { render, screen, waitFor } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'

import FeedbackPage from './FeedbackPage'

jest.mock('services/user')
jest.mock('../../layouts/shared/ErrorBoundary', () => ({ children }) => (
  <>{children}</>
))

const user = {
  cannySSOToken: 'token',
}

describe('FeedbackPage', () => {
  function setup(data) {
    useUser.mockReturnValue(user)
    render(
      <MemoryRouter initialEntries={['/gh/feedback']}>
        <Route path="/:provider/feedback">
          <FeedbackPage />
        </Route>
      </MemoryRouter>
    )
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('renders', () => {
    beforeAll(() => {
      jest.mock('./Canny/cannyUtils', () => {
        return {
          CannyLoader: jest.fn().mockImplementation(() => ({
            load: () => new Promise((resolve) => resolve()),
          })),
          Canny: jest.fn().mockImplementation(() => ({
            render: () => true,
          })),
        }
      })
      setup()
    })

    afterAll(() => {
      jest.unmock('./Canny/cannyUtils')
    })

    it('adds the canny div', async () => {
      const element = screen.getByTestId('canny-div')

      await waitFor(() => {
        expect(element).toBeInTheDocument()
      })
    })
  })
})
