import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import FeedbackLink from './FeedbackLink'

describe('FeedbackLink', () => {
  function setup({ entry, path }) {
    render(
      <MemoryRouter initialEntries={[entry]}>
        <Switch>
          <Route path={path} exact>
            <FeedbackLink />
          </Route>
        </Switch>
      </MemoryRouter>
    )
  }

  describe('user is on feedback route', () => {
    beforeEach(() => {
      setup({
        entry: '/gh/feedback',
        path: '/:provider/feedback',
      })
    })

    it('sets the text colour to pink', () => {
      const element = screen.getByText('Feedback')
      expect(element).toBeInTheDocument()
      expect(element.getAttribute('class')).toContain('text-ds-pink')
    })
  })

  describe('user is on another page', () => {
    beforeEach(() => {
      setup({
        entry: '/gh',
        path: '/:provider',
      })
    })

    it('sets the text colour to gray', () => {
      const element = screen.getByText('Feedback')
      expect(element).toBeInTheDocument()
      expect(element.getAttribute('class')).toContain('text-ds-gray-secondary')
    })
  })
})
