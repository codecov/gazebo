import { act, render, screen, waitFor } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'

import CannyWidget from './CannyWidget'

jest.mock('services/user')

jest.mock('./Canny', () => {
  return jest.fn().mockImplementation(() => {
    return { render: jest.fn() }
  })
})

jest.mock('./CannyLoader', () => {
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
          <CannyWidget />
        </Route>
      </MemoryRouter>
    )
  }

  describe('renders', () => {
    describe('successfully loads script', () => {
      beforeAll(() => {
        act(() => {
          setup()
        })
      })

      it('adds the canny div', async () => {
        const element = screen.getByTestId('canny-div')

        await waitFor(() => {
          expect(element).toBeInTheDocument()
        })
      })
    })

    describe('failing loads script', () => {
      it('adds the canny div', () => {
        let error
        try {
          act(() => {
            setup()
          })
        } catch (e) {
          error = e
        }

        expect(error.message).toBe('Unable to load Canny scripts')
      })
    })
  })
})
