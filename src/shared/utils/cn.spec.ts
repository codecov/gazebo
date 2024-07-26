/* eslint tailwindcss/no-custom-classname: 0 */
import { cn } from './cn'

describe('cn utility', () => {
  describe('classnames functionality', () => {
    it('should render styles conditionally', () => {
      const className = cn('text-white', {
        'bg-ds-primary-base': false,
        'bg-ds-pink-tertiary': true,
      })

      expect(className).toEqual('text-white bg-ds-pink-tertiary')
    })

    it('should handle many arguments', () => {
      const className = cn(
        'text-base text-white',
        {
          'bg-ds-primary-base': false,
          'bg-ds-pink-tertiary': true,
        },
        'asdf',
        { asdf: null },
        null
      )

      expect(className).toEqual('text-base text-white bg-ds-pink-tertiary asdf')
    })

    it('should flatten arrays', () => {
      const arr = ['b', { c: true, d: false }]
      const className = cn('a', arr)

      expect(className).toEqual('a b c')
    })
  })

  describe('tailwind-merge functionality', () => {
    it('should merge tailwind classes', () => {
      const className = cn(
        'bg-red hover:bg-dark-red px-2 py-1',
        'bg-[#B91C1C] p-3'
      )

      expect(className).toEqual('hover:bg-dark-red bg-[#B91C1C] p-3')
    })
  })
})
