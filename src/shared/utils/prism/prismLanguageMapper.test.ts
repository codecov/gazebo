import * as Sentry from '@sentry/react'

import { prismLanguageMapper } from './prismLanguageMapper'

vi.mock('@sentry/react', async () => {
  const originalModule = await vi.importActual('@sentry/react')
  return {
    ...originalModule,
    captureMessage: vi.fn(),
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
      { extension: 'h', expected: 'c' },
      { extension: 'cc', expected: 'cpp' },
      { extension: 'cpp', expected: 'cpp' },
      { extension: 'hpp', expected: 'cpp' },
      { extension: 'cs', expected: 'csharp' },
      { extension: 'cshtml', expected: 'cshtml' },
      { extension: 'css', expected: 'css' },
      { extension: 'dart', expected: 'dart' },
      { extension: 'f', expected: 'fortran' },
      { extension: 'fpp', expected: 'fortran' },
      { extension: 'f90', expected: 'fortran' },
      { extension: 'fs', expected: 'fsharp' },
      { extension: 'java', expected: 'java' },
      { extension: 'jl', expected: 'julia' },
      { extension: 'js', expected: 'javascript' },
      { extension: 'cjs', expected: 'javascript' },
      { extension: 'mjs', expected: 'javascript' },
      { extension: 'jsx', expected: 'jsx' },
      { extension: 'kt', expected: 'kotlin' },
      { extension: 'kts', expected: 'kotlin' },
      { extension: 'go', expected: 'go' },
      { extension: 'gql', expected: 'graphql' },
      { extension: 'graphql', expected: 'graphql' },
      { extension: 'json', expected: 'json' },
      { extension: 'less', expected: 'less' },
      { extension: 'objc', expected: 'objectivec' },
      { extension: 'ocaml', expected: 'ocaml' },
      { extension: 'php', expected: 'php' },
      { extension: 'py', expected: 'python' },
      { extension: 'r', expected: 'r' },
      { extension: 'ps1', expected: 'powershell' },
      { extension: 'psm1', expected: 'powershell' },
      { extension: 'razor', expected: 'cshtml' },
      { extension: 'rb', expected: 'ruby' },
      { extension: 'reason', expected: 'reason' },
      { extension: 'rs', expected: 'rust' },
      { extension: 'sass', expected: 'sass' },
      { extension: 'scala', expected: 'scala' },
      { extension: 'scss', expected: 'scss' },
      { extension: 'sol', expected: 'solidity' },
      { extension: 'sql', expected: 'sql' },
      { extension: 'swift', expected: 'swift' },
      { extension: 'svelte', expected: 'markup' },
      { extension: 'ts', expected: 'typescript' },
      { extension: 'tsx', expected: 'tsx' },
      { extension: 'vb', expected: 'visual-basic' },
      { extension: 'vba', expected: 'visual-basic' },
      { extension: 'vbs', expected: 'visual-basic' },
      { extension: 'vue', expected: 'markup' },
      { extension: 'wasm', expected: 'wasm' },
      { extension: 'yaml', expected: 'yaml' },
      { extension: 'zig', expected: 'zig' },
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
        {
          fingerprint: ['unsupported-prism-language'],
          tags: {
            'file.extension': 'omgwhatisdis',
          },
        }
      )
    })

    it('defaults to the default language type', () => {
      expect(prismLanguageMapper('file.omgwhatisdis')).toBe('markup')
    })
  })
})
