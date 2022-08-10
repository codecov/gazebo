import { render, screen } from '@testing-library/react'

import { useNavLinks } from 'services/navigation'

import { PlanBreadcrumbProvider, useCrumbs, useSetCrumbs } from './context'


jest.mock('services/navigation')

const TestComponent = () => {
  const crumbs = useCrumbs()
  const setCrumb = useSetCrumbs()

  return (
    <div>
      <ul>
        {crumbs.map(({ text, children }, i) => (
          <li key={i}>{text || children}</li>
        ))}
      </ul>
      <button
        onClick={() => setCrumb({ pageName: 'new crumb', text: 'New Crumb' })}
      >
        set crumb
      </button>
    </div>
  )
}

describe('Plan breadcrumb context', () => {
  function setup() {
    useNavLinks.mockReturnValue({ planTab: { path: () => '/plan/gh/codecov' } })

    render(
      <PlanBreadcrumbProvider>
        <TestComponent />
      </PlanBreadcrumbProvider>
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })
    it('crumbs return default crumb', () => {
      expect(screen.getByText('Current org plan')).toBeInTheDocument()
    })

    it('setCrumb can update the context', () => {
      const button = screen.getByRole('button')
      button.click()
      expect(screen.getByText('New Crumb')).toBeInTheDocument()
    })
  })
})
