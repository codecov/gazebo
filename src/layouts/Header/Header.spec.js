import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Header from './Header'
import { useUser } from 'services/user'

jest.mock('services/user')

const loggedInUser = {
  user: {
    username: 'p',
    avatarUrl: '',
  },
}

describe('Header', () => {
  it('renders the DesktopMenu', () => {
    useUser.mockReturnValue({ data: loggedInUser })
    const wrapper = render(<Header />, {
      wrapper: MemoryRouter,
    })
    const menu = wrapper.getByTestId('desktop-menu')
    expect(menu).toBeInTheDocument()
  })
})
