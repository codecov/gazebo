import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import YamlEditor from './YamlEditor'

describe('YamlEditor', () => {
  const onChangeMock = jest.fn()
  function setup(props) {
    render(<YamlEditor {...props} onChange={onChangeMock} />)
  }

  describe('when rendered', () => {
    it('renders text editor', () => {
      setup({ value: 'I am rendered!' })
      expect(screen.getByRole('textbox')).toBeTruthy()
    })
  })

  xdescribe('on user input', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      setup({ value: 'Banana' })
    })
    // Having a hard time getting ace runs its lifecycle correctly.
    it('sanatizes the returned value', async () => {
      expect(onChangeMock).toHaveBeenCalledTimes(0)
      screen.debug()
      userEvent.click(screen.getByTitle())
      userEvent.type(screen.getByRole('textbox'), 'Hello,{enter}World!')
      await fireEvent.change(screen.getByRole('textbox'), {
        target: {
          value: '<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>',
        },
      })

      expect(onChangeMock).toHaveBeenCalledTimes(1)
      expect(onChangeMock).toReturnWith('<p>abc</p>')
    })
  })
})
