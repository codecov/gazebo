import { render, screen } from '@testing-library/react'

import YamlEditor from './YamlEditor'

describe('YamlEditor', () => {
  function setup(props) {
    render(<YamlEditor {...props} readOnly />)
  }

  describe('when rendered', () => {
    it('renders text editor', () => {
      setup()
      expect(screen.getByRole('textbox')).toBeTruthy()
    })
  })
})
