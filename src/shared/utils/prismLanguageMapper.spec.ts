import * as Sentry from '@sentry/react'

import { prismLanguageMapper } from './prismLanguageMapper'

jest.mock('@sentry/react', () => {
  const originalModule = jest.requireActual('@sentry/react')
  return {
    ...originalModule,
    captureMessage: jest.fn(),
  }
})

describe('prismLanguageMapper', () => {
  describe('when called with a file with a valid extension', () => {
    const testCases = [
      { extension: 'html', expected: 'markup' },
      { extension: 'xml', expected: 'markup' },
      { extension: 'svg', expected: 'markup' },
      { extension: 'mathml', expected: 'markup' },
      { extension: 'ssml', expected: 'markup' },
      { extension: 'atom', expected: 'markup' },
      { extension: 'rss', expected: 'markup' },
      { extension: 'sh', expected: 'bash' },
      { extension: 'c', expected: 'c' },
      { extension: 'h', expected: 'clike' },
      { extension: 'cc', expected: 'cpp' },
      { extension: 'cpp', expected: 'cpp' },
      { extension: 'css', expected: 'css' },
      { extension: 'js', expected: 'javascript' },
      { extension: 'cjs', expected: 'javascript' },
      { extension: 'mjs', expected: 'javascript' },
      { extension: 'jsx', expected: 'jsx' },
      { extension: 'go', expected: 'go' },
      { extension: 'gql', expected: 'graphql' },
      { extension: 'graphql', expected: 'graphql' },
      { extension: 'json', expected: 'json' },
      { extension: 'less', expected: 'less' },
      { extension: 'objc', expected: 'objectivec' },
      { extension: 'ocaml', expected: 'ocaml' },
      { extension: 'py', expected: 'python' },
      { extension: 'reason', expected: 'reason' },
      { extension: 'sass', expected: 'sass' },
      { extension: 'scss', expected: 'scss' },
      { extension: 'sql', expected: 'sql' },
      { extension: 'ts', expected: 'typescript' },
      { extension: 'tsx', expected: 'tsx' },
      { extension: 'wasm', expected: 'wasm' },
      { extension: 'yaml', expected: 'yaml' },
    ]

    it.each(testCases)(
      'returns `$expected` for file extension `$extension`',
      ({ extension, expected }) => {
        expect(prismLanguageMapper(`file.${extension}`)).toBe(expected)
      }
    )
  })

  describe('when called with a file with an invalid extension', () => {
    it('sends a message to Sentry', () => {
      prismLanguageMapper('file.omgwhatisdis')

      expect(Sentry.captureMessage).toHaveBeenCalled()
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Unsupported language type for filename file.omgwhatisdis',
        { fingerprint: ['unsupported-prism-language'] }
      )
    })

    it('defaults to the default language type', () => {
      expect(prismLanguageMapper('file.omgwhatisdis')).toBe('markup')
    })
  })
})
