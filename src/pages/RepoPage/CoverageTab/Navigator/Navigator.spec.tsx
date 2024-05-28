import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { CoverageTabNavigator } from '.'

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

const provider = 'gh'
const owner = 'codecov'
const repo = 'cool-repo'

describe('CoverageTabNavigator', () => {
  it('renders', async () => {
    render(
      <CoverageTabNavigator provider={provider} owner={owner} repo={repo} />,
      { wrapper: wrapper() }
    )

    const overview = await screen.findByText('Overview')
    const flags = await screen.findByText('Flags')
    const components = await screen.findByText('Components')
    expect(overview).toBeInTheDocument()
    expect(flags).toBeInTheDocument()
    expect(components).toBeInTheDocument()
  })

  describe('initial selection', () => {
    describe('when not on flags or components tabs', () => {
      it('selects Overview as default', async () => {
        render(
          <CoverageTabNavigator
            provider={provider}
            owner={owner}
            repo={repo}
          />,
          { wrapper: wrapper() }
        )

        const overview = await screen.findByTestId('overview-radio')
        expect(overview).toBeInTheDocument()
        expect(overview).toHaveAttribute('data-state', 'checked')
      })
    })

    describe('when loaded with flags url', () => {
      it('selects flags as default', async () => {
        render(
          <CoverageTabNavigator
            provider={provider}
            owner={owner}
            repo={repo}
          />,
          {
            wrapper: wrapper('/gh/codecov/cool-repo/flags'),
          }
        )

        const flags = await screen.findByTestId('flags-radio')
        expect(flags).toBeInTheDocument()
        expect(flags).toHaveAttribute('data-state', 'checked')
      })
    })

    describe('when loaded with components url', () => {
      it('selects components as default', async () => {
        render(
          <CoverageTabNavigator
            provider={provider}
            owner={owner}
            repo={repo}
          />,
          {
            wrapper: wrapper('/gh/codecov/cool-repo/components'),
          }
        )

        const components = await screen.findByTestId('components-radio')
        expect(components).toBeInTheDocument()
        expect(components).toHaveAttribute('data-state', 'checked')
      })
    })
  })

  describe('navigation', () => {
    describe('when Overview is selected', () => {
      it('should navigate to base coverage tab', async () => {
        const user = userEvent.setup()
        render(
          <CoverageTabNavigator
            provider={provider}
            owner={owner}
            repo={repo}
          />,
          {
            wrapper: wrapper('/gh/codecov/cool-repo/flags'),
          }
        )

        const overview = await screen.findByTestId('overview-radio')
        expect(overview).toBeInTheDocument()
        expect(overview).toHaveAttribute('data-state', 'unchecked')

        await user.click(overview)

        expect(overview).toBeInTheDocument()
        expect(overview).toHaveAttribute('data-state', 'checked')

        expect(testLocation.pathname).toBe('/gh/codecov/cool-repo')
      })
    })

    describe('when Flags is selected', () => {
      it('should navigate to flags coverage tab', async () => {
        const user = userEvent.setup()
        render(
          <CoverageTabNavigator
            provider={provider}
            owner={owner}
            repo={repo}
          />,
          {
            wrapper: wrapper('/gh/codecov/cool-repo'),
          }
        )

        const flags = await screen.findByTestId('flags-radio')
        expect(flags).toBeInTheDocument()
        expect(flags).toHaveAttribute('data-state', 'unchecked')

        await user.click(flags)

        expect(flags).toBeInTheDocument()
        expect(flags).toHaveAttribute('data-state', 'checked')

        expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/flags')
      })
    })

    describe('when Components is selected', () => {
      it('should navigate to components coverage tab', async () => {
        const user = userEvent.setup()
        render(
          <CoverageTabNavigator
            provider={provider}
            owner={owner}
            repo={repo}
          />,
          {
            wrapper: wrapper('/gh/codecov/cool-repo'),
          }
        )

        const components = await screen.findByTestId('components-radio')
        expect(components).toBeInTheDocument()
        expect(components).toHaveAttribute('data-state', 'unchecked')

        await user.click(components)

        expect(components).toBeInTheDocument()
        expect(components).toHaveAttribute('data-state', 'checked')

        expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/components')
      })
    })
  })
})
