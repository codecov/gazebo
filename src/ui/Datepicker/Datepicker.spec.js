// import { render, screen } from 'custom-testing-library'
// import userEvent from '@testing-library/user-event'
// import OptionButton from './OptionButton'

// describe('OptionButton', () => {
//   let props
//   let onChange = jest.fn()
//   const defaultProps = {
//     onChange: onChange,
//   }

//   function setup(over = {}) {
//     props = {
//       ...over,
//       ...defaultProps,
//     }
//     render(<OptionButton {...props} />)
//   }

//   describe('when the modal is closed', () => {
//     beforeEach(() => {
//       setup({
//         options: [{ text: 'test option 1' }, { text: 'test option 2' }],
//       })
//     })

//     it('renders options', () => {
//       expect(screen.queryByText('test option 1')).toBeInTheDocument()
//       expect(screen.queryByText('test option 2')).toBeInTheDocument()
//     })
//     it('fires click event', () => {
//       userEvent.click(screen.queryByText('test option 2'))
//       expect(onChange).toHaveBeenCalled()
//     })
//   })
// })
