import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'

import { OptionButton } from './OptionButton'

const options = [{ text: 'test option 1' }, { text: 'test option 2' }]

describe('OptionButton', () => {
  it('renders options', () => {
    const onChange = vi.fn()

    render(
      <OptionButton onChange={onChange} options={options} active="active" />
    )

    const optionOne = screen.getByRole('button', { name: 'test option 1' })
    expect(optionOne).toBeInTheDocument()

    const optionTwo = screen.getByRole('button', { name: 'test option 2' })
    expect(optionTwo).toBeInTheDocument()
  })

  it('fires click event', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <OptionButton onChange={onChange} options={options} active="active" />
    )

    const optionTwo = screen.getByRole('button', { name: 'test option 2' })
    await user.click(optionTwo)
    expect(onChange).toHaveBeenCalled()
  })

  describe('when disable prop is true', () => {
    it('sets buttons as disabled', () => {
      const onChange = vi.fn()

      render(
        <OptionButton
          onChange={onChange}
          options={options}
          active="active"
          disabled={true}
        />
      )

      const optionOne = screen.getByRole('button', { name: 'test option 1' })
      expect(optionOne).toBeInTheDocument()
      expect(optionOne).toBeDisabled()

      const optionTwo = screen.getByRole('button', { name: 'test option 2' })
      expect(optionTwo).toBeInTheDocument()
      expect(optionTwo).toBeDisabled()
    })
  })

  describe('when type prop is passed', () => {
    describe('when type is button', () => {
      it('sets type attribute as button', () => {
        const onChange = vi.fn()

        render(
          <OptionButton
            onChange={onChange}
            options={options}
            active="active"
            type="button"
          />
        )

        const optionOne = screen.getByRole('button', { name: 'test option 1' })
        expect(optionOne).toBeInTheDocument()
        expect(optionOne).toHaveAttribute('type', 'button')

        const optionTwo = screen.getByRole('button', { name: 'test option 2' })
        expect(optionTwo).toBeInTheDocument()
        expect(optionTwo).toHaveAttribute('type', 'button')
      })
    })

    describe('when type is reset', () => {
      it('sets type attribute as reset', () => {
        const onChange = vi.fn()

        render(
          <OptionButton
            onChange={onChange}
            options={options}
            active="active"
            type="reset"
          />
        )

        const optionOne = screen.getByRole('button', { name: 'test option 1' })
        expect(optionOne).toBeInTheDocument()
        expect(optionOne).toHaveAttribute('type', 'reset')

        const optionTwo = screen.getByRole('button', { name: 'test option 2' })
        expect(optionTwo).toBeInTheDocument()
        expect(optionTwo).toHaveAttribute('type', 'reset')
      })
    })

    describe('when type is submit', () => {
      it('sets type attribute as submit', () => {
        const onChange = vi.fn()

        render(
          <OptionButton
            onChange={onChange}
            options={options}
            active="active"
            type="submit"
          />
        )

        const optionOne = screen.getByRole('button', { name: 'test option 1' })
        expect(optionOne).toBeInTheDocument()
        expect(optionOne).toHaveAttribute('type', 'submit')

        const optionTwo = screen.getByRole('button', { name: 'test option 2' })
        expect(optionTwo).toBeInTheDocument()
        expect(optionTwo).toHaveAttribute('type', 'submit')
      })
    })
  })
})
