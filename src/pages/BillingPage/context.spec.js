import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BillingBreadcrumbProvider, useCrumbs, useSetCrumbs } from './context'

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
      <button onClick={() => setCrumb({ pageName: 'added' })}>
        set crumb
      </button>
    </div>
  )
}

describe('Billing breadcrumb context', () => {
  function setup() {
    render(
    <BillingBreadcrumbProvider>
    <TestComponent />
    </BillingBreadcrumbProvider>
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
      fireEvent.click(button)
      waitFor(() => expect(screen.getByText('added')).toBeInTheDocument())
    })
  })
})
