import { act, render, screen, waitFor } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'

import CannyWidget from './CannyWidget'

jest.mock('services/user')

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
        jest.mock('./cannyUtils', () => {
          return {
            CannyLoader: jest.fn().mockImplementation(() => ({
              load: () => new Promise((resolve) => resolve()),
            })),
            Canny: jest.fn().mockImplementation(() => ({
              render: () => true,
            })),
          }
        })

        act(() => {
          setup()
        })
      })

      afterAll(() => {
        jest.unmock('./cannyUtils')
      })

      it('adds the canny div', async () => {
        const element = screen.getByTestId('canny-div')

        await waitFor(() => {
          expect(element).toBeInTheDocument()
        })
      })
    })

    describe('failing loads script', () => {
      beforeAll(() => {
        jest.mock('./cannyUtils', () => {
          return {
            CannyLoader: jest.fn().mockImplementation(() => ({
              load: () => Promise.reject(),
            })),
            Canny: jest.fn().mockImplementation(() => ({
              render: () => true,
            })),
          }
        })
        setup()
      })

      afterAll(() => {
        jest.unmock('./cannyUtils')
      })

      it('adds the canny div', async () => {
        // await expect(
        //   render(
        //     <MemoryRouter initialEntries={['/gh/feedback']}>
        //       <Route path="/:provider/feedback">
        //         <CannyWidget />
        //       </Route>
        //     </MemoryRouter>
        //   )
        // ).toThrow('')

        await waitFor(
          () =>
            expect(
              render(
                <MemoryRouter initialEntries={['/gh/feedback']}>
                  <Route path="/:provider/feedback">
                    <CannyWidget />
                  </Route>
                </MemoryRouter>
              )
            ).toThrow(new Error('')),
          { interval: 100 }
        )
      })
    })
  })
})
