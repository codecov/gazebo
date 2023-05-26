import { act, render, screen, waitFor } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'

import Canny from './Canny'
import CannyLoader from './CannyLoader'
import CannyWidget from './CannyWidget'

jest.mock('services/user')

jest.mock('./Canny')
jest.mock('./CannyLoader')

const user = {
  cannySSOToken: 'token',
}

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/feedback']}>
    <Route path="/:provider/feedback">{children}</Route>
  </MemoryRouter>
)

describe('FeedbackPage', () => {
  function setup(successfulLoad = true) {
    useUser.mockReturnValue(user)
    Canny.mockImplementation(() => ({
      render: jest.fn(),
    }))

    CannyLoader.mockImplementation(() => {
      if (successfulLoad) {
        return {
          load: jest
            .fn()
            .mockImplementation(() => new Promise((resolve) => resolve())),
        }
      }

      return {
        load: jest
          .fn()
          .mockImplementation(() => new Promise((_, reject) => reject())),
      }
    })
  }

  describe('renders', () => {
    describe('successfully loads script', () => {
      it.only('adds the canny div', async () => {
        act(() => {
          setup()
        })

        render(<CannyWidget />, { wrapper })

        const element = screen.getByTestId('canny-div')

        await waitFor(() => {
          expect(element).toBeInTheDocument()
        })
      })
    })

    describe('failing loads script', () => {
      it('adds the canny div', async () => {
        setup(false)

        let error

        try {
          render(<CannyWidget />, { wrapper })
        } catch (e) {
          error = e
        }

        expect(error).toBe('Unable to load Canny scripts')
      })
    })
  })
})
