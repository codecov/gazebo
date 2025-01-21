import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Theme, ThemeContext } from 'shared/ThemeContext/ThemeContext'

import LightDarkImg from './LightDarkImg'

const wrapper = (theme: Theme) => {
  return ({ children }: { children: React.ReactNode }) => {
    return (
      <ThemeContext.Provider value={{ theme, setTheme: vi.fn() }}>
        {children}
      </ThemeContext.Provider>
    )
  }
}

describe('LightDarkImg', () => {
  const mockProps = {
    src: '/light-image.png',
    darkSrc: '/dark-image.png',
    alt: 'Test image',
  }

  it('renders with light source in light mode', () => {
    render(<LightDarkImg {...mockProps} />, { wrapper: wrapper(Theme.LIGHT) })

    const img = screen.getByAltText('Test image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/light-image.png')
  })

  it('renders with dark source in dark mode', () => {
    render(<LightDarkImg {...mockProps} />, { wrapper: wrapper(Theme.DARK) })

    const img = screen.getByAltText('Test image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/dark-image.png')
  })

  it('falls back to light source when dark source is not provided', () => {
    const propsWithoutDark = {
      src: '/light-image.png',
      alt: 'Test image',
    }

    render(<LightDarkImg {...propsWithoutDark} />, {
      wrapper: wrapper(Theme.DARK),
    })

    const img = screen.getByAltText('Test image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/light-image.png')
  })

  it('passes through additional props to img element', () => {
    render(
      <LightDarkImg {...mockProps} className="w-10" data-testid="test-img" />,
      { wrapper: wrapper(Theme.LIGHT) }
    )

    const img = screen.getByAltText('Test image')
    expect(img).toHaveClass('w-10')
    expect(img).toHaveAttribute('data-testid', 'test-img')
  })
})
