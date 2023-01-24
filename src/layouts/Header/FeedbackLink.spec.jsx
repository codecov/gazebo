import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import config from 'config'

import FeedbackLink from './FeedbackLink'

jest.mock('config')

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

  describe('does not render for enterprise', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = true
      setup({
        entry: '/gh/feedback',
        path: '/:provider/feedback',
      })
    })
    afterEach(() => jest.resetAllMocks())

    it('sets the text colour to pink', () => {
      const element = screen.queryByText('Feedback')
      expect(element).not.toBeInTheDocument()
    })
  })
})
