/*
 * Maps file extension names to prism supported languages.
 * The full list can be found in the prism-react-renderer package:
 * https://github.com/FormidableLabs/prism-react-renderer/blob/v1.3.5/src/vendor/prism/includeLangs.js
 */
import * as Sentry from '@sentry/react'
import { type Language } from 'prism-react-renderer'
// @ts-expect-error - there are no types included for this from the prism-react-renderer package
import Prism from 'prism-react-renderer/prism'
;(typeof global !== 'undefined' ? global : window).Prism = Prism

/**
 * Importing all the languages we want to support that are not included in the
 * prism-react-renderer package by default.
 *
 * Docs: https://github.com/FormidableLabs/prism-react-renderer/tree/v1.3.5?tab=readme-ov-file#faq
 */
require('prismjs/components/prism-csharp')
require('prismjs/components/prism-java')
require('prismjs/components/prism-kotlin')
require('prismjs/components/prism-php')
require('prismjs/components/prism-ruby')
require('prismjs/components/prism-rust')
require('prismjs/components/prism-zig')

const prismSupportedLanguages = new Map<string, string>([
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
  ['cs', 'csharp'],
  ['css', 'css'],
  ['java', 'java'],
  ['js', 'javascript'],
  ['cjs', 'javascript'],
  ['mjs', 'javascript'],
  ['jsx', 'jsx'],
  ['kt', 'kotlin'],
  ['kts', 'kotlin'],
  ['go', 'go'],
  ['gql', 'graphql'],
  ['graphql', 'graphql'],
  ['json', 'json'],
  ['less', 'less'],
  ['objc', 'objectivec'],
  ['ocaml', 'ocaml'],
  ['php', 'php'],
  ['py', 'python'],
  ['rb', 'ruby'],
  ['reason', 'reason'],
  ['rs', 'rust'],
  ['sass', 'sass'],
  ['scss', 'scss'],
  ['sql', 'sql'],
  ['ts', 'typescript'],
  ['tsx', 'tsx'],
  ['wasm', 'wasm'],
  ['yaml', 'yaml'],
  ['zig', 'zig'],
])

const DEFAULT_LANGUAGE_TYPE: Language = 'markup'

export function prismLanguageMapper(fileName: string): Language {
  const fileExtension = fileName.split('.').pop() ?? ''

  const supportedLanguage = prismSupportedLanguages.get(fileExtension)
  // we need to cast this, because we're adding in extra languages that aren't in the prism-react-renderer package
  if (supportedLanguage) return supportedLanguage as Language

  Sentry.captureMessage(`Unsupported language type for filename ${fileName}`, {
    fingerprint: ['unsupported-prism-language'],
  })
  return DEFAULT_LANGUAGE_TYPE
}
