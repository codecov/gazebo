/*
 * Maps file extension names to prism supported languages.
 * The full list can be found in the prism-react-renderer package:
 * https://github.com/FormidableLabs/prism-react-renderer/blob/v1.3.5/src/vendor/prism/includeLangs.js
 */
import * as Sentry from '@sentry/react'
import { type Language } from 'prism-react-renderer'

const prismSupportedLanguages = new Map<string, Language>([
  ['html', 'markup'],
  ['xml', 'markup'],
  ['svg', 'markup'],
  ['mathml', 'markup'],
  ['ssml', 'markup'],
  ['atom', 'markup'],
  ['rss', 'markup'],
  ['sh', 'bash'],
  ['c', 'c'],
  ['h', 'clike'],
  ['cc', 'cpp'],
  ['cpp', 'cpp'],
  ['css', 'css'],
  ['js', 'javascript'],
  ['cjs', 'javascript'],
  ['mjs', 'javascript'],
  ['jsx', 'jsx'],
  ['go', 'go'],
  ['gql', 'graphql'],
  ['graphql', 'graphql'],
  ['json', 'json'],
  ['less', 'less'],
  ['objc', 'objectivec'],
  ['ocaml', 'ocaml'],
  ['py', 'python'],
  ['reason', 'reason'],
  ['sass', 'sass'],
  ['scss', 'scss'],
  ['sql', 'sql'],
  ['ts', 'typescript'],
  ['tsx', 'tsx'],
  ['wasm', 'wasm'],
  ['yaml', 'yaml'],
])

const DEFAULT_LANGUAGE_TYPE: Language = 'markup'

export function prismLanguageMapper(fileName: string): Language {
  const fileExtension = fileName.split('.').pop() ?? ''

  const supportedLanguage = prismSupportedLanguages.get(fileExtension)
  if (supportedLanguage) return supportedLanguage

  Sentry.captureMessage(`Unsupported language type for filename ${fileName}`, {
    fingerprint: ['unsupported-prism-language'],
  })
  return DEFAULT_LANGUAGE_TYPE
}
