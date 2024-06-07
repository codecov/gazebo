import { render, screen } from '@testing-library/react'
import React from 'react'

import FormLabel from './FormLabel'

describe('FormLabel', () => {
  it('should render label if label is provided, and icon should not render', () => {
    render(<FormLabel label="Form label placeholder" />)
    expect(screen.getByText('Form label placeholder')).toBeInTheDocument()
    expect(screen.queryByTestId('form-label-icon')).not.toBeInTheDocument()
  })
  it('should render label and icon if provided', () => {
    render(<FormLabel label="Form label placeholder" icon={<div>ICON</div>} />)
    expect(screen.getByText('Form label placeholder')).toBeInTheDocument()
    expect(screen.getByTestId('form-label-icon')).toBeInTheDocument()
  })
})
