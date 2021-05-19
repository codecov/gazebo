import { render, screen } from '@testing-library/react'

import YAML from './YAML'

xdescribe('YAMLTab', () => {
  function setup(url) {
    render(<YAML />)
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup('/')
    })

    it('renders something', () => {
      const tab = screen.getByText(
        /Changes made to the Global yml will override the default repo settings and is applied to all repositories in the org./
      )
      expect(tab).toBeInTheDocument()
    })
  })

  // Moving sanatize tests to the submit button
  // describe('onSubmit', () => {
  //     beforeEach(() => {
  //       jest.resetAllMocks()
  //       setup({ value: 'Banana' })
  //     })
  //     // Having a hard time getting ace runs its lifecycle correctly.
  //     it('sanatizes the returned value', async () => {
  //       expect(onChangeMock).toHaveBeenCalledTimes(0)
  //       screen.debug()
  //       userEvent.click(screen.getByTitle())
  //       userEvent.type(screen.getByRole('textbox'), 'Hello,{enter}World!')
  //       await fireEvent.change(screen.getByRole('textbox'), {
  //         target: {
  //           value: '<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>',
  //         },
  //       })

  //       expect(onChangeMock).toHaveBeenCalledTimes(1)
  //       expect(onChangeMock).toReturnWith('<p>abc</p>')
  //     })
})
