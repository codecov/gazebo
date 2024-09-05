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
require('prismjs/components/prism-dart')
require('prismjs/components/prism-cshtml')
require('prismjs/components/prism-fortran')
require('prismjs/components/prism-fsharp')
require('prismjs/components/prism-java')
require('prismjs/components/prism-julia')
require('prismjs/components/prism-kotlin')
require('prismjs/components/prism-php')
require('prismjs/components/prism-r')
require('prismjs/components/prism-ruby')
require('prismjs/components/prism-rust')
require('prismjs/components/prism-scala')
require('prismjs/components/prism-powershell')
require('prismjs/components/prism-ruby')
require('prismjs/components/prism-rust')
require('prismjs/components/prism-solidity')
require('prismjs/components/prism-swift')
require('prismjs/components/prism-visual-basic')
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
  ['h', 'c'],
  ['cc', 'cpp'],
  ['cpp', 'cpp'],
  ['hpp', 'cpp'],
  ['cs', 'csharp'],
  ['cshtml', 'cshtml'],
  ['css', 'css'],
  ['dart', 'dart'],
  ['f', 'fortran'],
  ['fpp', 'fortran'],
  ['f90', 'fortran'],
  ['fs', 'fsharp'],
  ['java', 'java'],
  ['jl', 'julia'],
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
  ['r', 'r'],
  ['ps1', 'powershell'],
  ['psm1', 'powershell'],
  ['razor', 'cshtml'],
  ['rb', 'ruby'],
  ['reason', 'reason'],
  ['rs', 'rust'],
  ['sass', 'sass'],
  ['scala', 'scala'],
  ['scss', 'scss'],
  ['sol', 'solidity'],
  ['sql', 'sql'],
  ['swift', 'swift'],
  // svelte does not have full support yet - may look into this third party
  // https://github.com/PrismJS/prism/issues/2090
  ['svelte', 'markup'],
  ['ts', 'typescript'],
  ['tsx', 'tsx'],
  ['vb', 'visual-basic'],
  ['vba', 'visual-basic'],
  ['vbs', 'visual-basic'],
  // vue does not have full support yet
  // https://github.com/PrismJS/prism/issues/1665
  ['vue', 'markup'],
  ['wasm', 'wasm'],
  ['yaml', 'yaml'],
  ['zig', 'zig'],
])

const DEFAULT_LANGUAGE_TYPE: Language = 'markup'

export function prismLanguageMapper(fileName: string): Language {
  const fileExtension = fileName.split('.').pop() ?? ''

  // casting this to lower, as in Sentry I've seen some file extensions in uppercase
  const supportedLanguage = prismSupportedLanguages.get(
    fileExtension.toLowerCase()
  )
  // we need to cast this, because we're adding in extra languages that aren't in the prism-react-renderer package
  if (supportedLanguage) return supportedLanguage as Language

  Sentry.captureMessage(`Unsupported language type for filename ${fileName}`, {
    fingerprint: ['unsupported-prism-language'],
    tags: {
      'file.extension': fileExtension,
    },
  })
  return DEFAULT_LANGUAGE_TYPE
}
