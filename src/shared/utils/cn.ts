import classNames from 'classnames'
import { twMerge } from 'tailwind-merge'

// Combines the features of classnames and tailwind-merge into one, easy-to-use
// utility. Drop in replacement for both classnames and tailwind-merge.
export function cn(...inputs: classNames.ArgumentArray) {
  return twMerge(classNames(inputs))
}
