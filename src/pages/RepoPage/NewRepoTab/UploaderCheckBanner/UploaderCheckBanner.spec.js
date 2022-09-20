import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import UploaderCheckBanner from './UploaderCheckBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('UploaderCheckBanner', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
        <Route path="/:provider/:owner/:repo/new" exact={true}>
          <QueryClientProvider client={queryClient}>
            <UploaderCheckBanner />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders heading and content components', () => {
      expect(
        screen.getByText('integrity check the uploader')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /This will verify the uploader integrity before uploading to Codecov./
        )
      ).toBeInTheDocument()
    })
  })
})
