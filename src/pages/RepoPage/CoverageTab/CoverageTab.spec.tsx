import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import CoverageTab from './CoverageTab'

jest.mock('./OverviewTab', () => () => 'OverviewTab')
jest.mock('./FlagsTab', () => () => 'FlagsTab')
jest.mock('./ComponentsTab', () => () => 'ComponentsTab')

let testLocation: ReturnType<typeof useLocation>

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo',
            '/:provider/:owner/:repo/flags',
            '/:provider/:owner/:repo/components',
          ]}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    )

describe('CoverageTab', () => {
  it('renders', async () => {
    render(<CoverageTab />, { wrapper: wrapper() })

    const overview = await screen.findByText('Overview')
    const flags = await screen.findByText('Flags')
    const components = await screen.findByText('Components')
    expect(overview).toBeInTheDocument()
    expect(flags).toBeInTheDocument()
    expect(components).toBeInTheDocument()

    const content = await screen.findByText('OverviewTab')
    expect(content).toBeInTheDocument()
  })

  describe('initial selection', () => {
    describe('when not on flags or components tabs', () => {
      it('selects Overview as default', async () => {
        render(<CoverageTab />, { wrapper: wrapper() })

        const overview = await screen.findByTestId('overview-radio')
        expect(overview).toBeInTheDocument()
        expect(overview).toHaveAttribute('data-state', 'checked')
        const content = await screen.findByText('OverviewTab')
        expect(content).toBeInTheDocument()
      })
    })

    describe('when loaded with flags url', () => {
      it('selects flags as default', async () => {
        render(<CoverageTab />, {
          wrapper: wrapper('/gh/codecov/cool-repo/flags'),
        })

        const flags = await screen.findByTestId('flags-radio')
        expect(flags).toBeInTheDocument()
        expect(flags).toHaveAttribute('data-state', 'checked')
        const content = await screen.findByText('FlagsTab')
        expect(content).toBeInTheDocument()
      })
    })

    describe('when loaded with components url', () => {
      it('selects components as default', async () => {
        render(<CoverageTab />, {
          wrapper: wrapper('/gh/codecov/cool-repo/components'),
        })

        const components = await screen.findByTestId('components-radio')
        expect(components).toBeInTheDocument()
        expect(components).toHaveAttribute('data-state', 'checked')
        const content = await screen.findByText('ComponentsTab')
        expect(content).toBeInTheDocument()
      })
    })

    it('matches path with query params', async () => {
      render(<CoverageTab />, {
        wrapper: wrapper('/gh/codecov/cool-repo/components?branch=asdf'),
      })

      const components = await screen.findByTestId('components-radio')
      expect(components).toBeInTheDocument()
      expect(components).toHaveAttribute('data-state', 'checked')
      const content = await screen.findByText('ComponentsTab')
      expect(content).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    describe('when Overview is selected', () => {
      it('should navigate to base coverage tab', async () => {
        const user = userEvent.setup()
        render(<CoverageTab />, {
          wrapper: wrapper('/gh/codecov/cool-repo/flags'),
        })

        const overview = await screen.findByTestId('overview-radio')
        expect(overview).toBeInTheDocument()
        expect(overview).toHaveAttribute('data-state', 'unchecked')
        const flagsTab = await screen.findByText('FlagsTab')
        expect(flagsTab).toBeInTheDocument()

        await user.click(overview)

        expect(overview).toBeInTheDocument()
        expect(overview).toHaveAttribute('data-state', 'checked')
        const overviewTab = await screen.findByText('OverviewTab')
        expect(overviewTab).toBeInTheDocument()

        expect(testLocation.pathname).toBe('/gh/codecov/cool-repo')
      })
    })

    describe('when Flags is selected', () => {
      it('should navigate to flags coverage tab', async () => {
        const user = userEvent.setup()
        render(<CoverageTab />, {
          wrapper: wrapper('/gh/codecov/cool-repo'),
        })

        const flags = await screen.findByTestId('flags-radio')
        expect(flags).toBeInTheDocument()
        expect(flags).toHaveAttribute('data-state', 'unchecked')
        const overviewTab = await screen.findByText('OverviewTab')
        expect(overviewTab).toBeInTheDocument()

        await user.click(flags)

        expect(flags).toBeInTheDocument()
        expect(flags).toHaveAttribute('data-state', 'checked')
        const flagsTab = await screen.findByText('FlagsTab')
        expect(flagsTab).toBeInTheDocument()

        expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/flags')
      })
    })

    describe('when Components is selected', () => {
      it('should navigate to components coverage tab', async () => {
        const user = userEvent.setup()
        render(<CoverageTab />, {
          wrapper: wrapper('/gh/codecov/cool-repo'),
        })

        const components = await screen.findByTestId('components-radio')
        expect(components).toBeInTheDocument()
        expect(components).toHaveAttribute('data-state', 'unchecked')
        const overviewTab = await screen.findByText('OverviewTab')
        expect(overviewTab).toBeInTheDocument()

        await user.click(components)

        expect(components).toBeInTheDocument()
        expect(components).toHaveAttribute('data-state', 'checked')
        const componentsTab = await screen.findByText('ComponentsTab')
        expect(componentsTab).toBeInTheDocument()

        expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/components')
      })
    })
  })
})
