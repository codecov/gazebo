import { render, screen } from '@testing-library/react'

import YamlEditor from './YamlEditor'
// import 'react-ace'

// jest.mock('react-ace')

describe('YamlEditor', () => {
  function setup(props) {
    render(<YamlEditor {...props} />)
  }

  describe('when rendered', () => {
    it('renders text editor', () => {
      setup({ language: 'text' })
      screen.debug()
    })
  })
})
