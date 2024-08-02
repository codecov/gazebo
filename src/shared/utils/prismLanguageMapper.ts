/*
 * Maps file extension names to prism supported languages.
 * The full list can be found in the prism-react-renderer package, just cmd +
 * click on the import string.
 */

import { type Language } from 'prism-react-renderer'

const prismSupportedLanguages = new Map([
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

export function prismLanguageMapper(fileName: string): Language {
  const fileExtension = fileName.split('.').pop() ?? ''

  // we have to return something or else TS will complain
  const lang = prismSupportedLanguages.get(fileExtension) ?? 'markup'
  return lang as Language
}
