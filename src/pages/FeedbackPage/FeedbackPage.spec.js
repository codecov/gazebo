import { render, screen, waitFor } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'

import FeedbackPage from './FeedbackPage'

jest.mock('services/user')

jest.mock('./Canny/Canny', () => {
  return jest.fn().mockImplementation(() => {
    return { render: jest.fn() }
  })
})

jest.mock('./Canny/CannyLoader', () => {
  return jest
    .fn()
    .mockImplementationOnce(() => {
      return {
        load: jest
          .fn()
          .mockImplementation(
            () => new Promise((resolve, reject) => resolve())
          ),
      }
    })
    .mockImplementationOnce(() => {
      return {
        load: jest
          .fn()
          .mockImplementation(() => new Promise((resolve, reject) => reject())),
      }
    })
})

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

  describe('renders', () => {
    describe('successfully loads scripts', () => {
      beforeAll(() => {
        setup()
      })

      it('adds the canny div', async () => {
        const element = screen.getByTestId('canny-div')

        await waitFor(() => {
          expect(element).toBeInTheDocument()
        })
      })
    })

    describe('does not load scripts successfully', () => {
      beforeAll(() => {
        setup()
      })

      it('adds the canny div', async () => {
        const element = screen.getByText(/There's been an error/i)

        await waitFor(() => {
          expect(element).toBeInTheDocument()
        })
      })
    })
  })
})
