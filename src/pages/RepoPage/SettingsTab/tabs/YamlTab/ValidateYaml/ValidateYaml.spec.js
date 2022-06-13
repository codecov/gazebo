import { render, screen } from '@testing-library/react'

import ValidateYaml from './ValidateYaml'

describe('ValidateYaml', () => {
  function setup() {
    render(<ValidateYaml />)
  }

  describe('renders ValidateYaml', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', () => {
      const title = screen.getByText(/Validate the yaml/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const p = screen.getByText(
        /Use this shell script to post your yaml to Codecov to be checked for syntax and layout issues./
      )
      expect(p).toBeInTheDocument()
    })

    it('renders token', () => {
      const token = screen.getByText(
        /cat codecov.yml | curl --data-binary @- htttokens:\/\/codecov.io\/validate/
      )
      expect(token).toBeInTheDocument()
    })
  })
})
