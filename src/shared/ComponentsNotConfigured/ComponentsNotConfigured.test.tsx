import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import ComponentsNotConfigured from './ComponentsNotConfigured'

describe('ComponentsNotConfigured', () => {
  const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/components']}>
      <Route path="/:provider/:owner/:repo/components">{children}</Route>
    </MemoryRouter>
  )

  describe('when rendered', () => {
    it('renders the no data message', () => {
      render(<ComponentsNotConfigured />, { wrapper })

      const noDataMessage = screen.getByText('No data to display')
      expect(noDataMessage).toBeInTheDocument()
    })

    it('renders the configure components button', () => {
      render(<ComponentsNotConfigured />, { wrapper })

      const configureComponentsButton = screen.getByRole('link', {
        name: /Get started with components/i,
      })
      expect(configureComponentsButton).toBeInTheDocument()
    })
  })
})
