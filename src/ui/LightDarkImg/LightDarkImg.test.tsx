import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Theme, ThemeContext } from 'shared/ThemeContext/ThemeContext'

import LightDarkImg from './LightDarkImg'

const renderWithTheme = (ui: React.ReactElement, theme: Theme) => {
  return render(
    <ThemeContext.Provider value={{ theme, setTheme: vi.fn() }}>
      {ui}
    </ThemeContext.Provider>
  )
}

describe('LightDarkImg', () => {
  const mockProps = {
    src: '/light-image.png',
    darkSrc: '/dark-image.png',
    alt: 'Test image',
  }

  it('renders with light source in light mode', () => {
    renderWithTheme(<LightDarkImg {...mockProps} />, Theme.LIGHT)

    const img = screen.getByAltText('Test image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/light-image.png')
  })

  it('renders with dark source in dark mode', () => {
    renderWithTheme(<LightDarkImg {...mockProps} />, Theme.DARK)

    const img = screen.getByAltText('Test image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/dark-image.png')
  })

  it('falls back to light source when dark source is not provided', () => {
    const propsWithoutDark = {
      src: '/light-image.png',
      alt: 'Test image',
    }

    renderWithTheme(<LightDarkImg {...propsWithoutDark} />, Theme.DARK)

    const img = screen.getByAltText('Test image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/light-image.png')
  })

  it('passes through additional props to img element', () => {
    renderWithTheme(
      <LightDarkImg
        {...mockProps}
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className="test-class"
        data-testid="test-img"
      />,
      Theme.LIGHT
    )

    const img = screen.getByAltText('Test image')
    expect(img).toHaveClass('test-class')
    expect(img).toHaveAttribute('data-testid', 'test-img')
  })
})
