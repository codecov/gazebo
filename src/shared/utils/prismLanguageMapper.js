import { sanitize } from 'dompurify'

/*
 * Maps file extension names to prism supported languages. Full list here
 * https://github.com/FormidableLabs/prism-react-renderer/blob/master/src/vendor/prism/includeLangs.js
 * <file extension>:<prisma language>
 */
const prismSupportedLanguages = {
  sh: 'bash',
  c: 'c',
  cpp: 'cpp',
  js: 'javascript',
  go: 'go',
  py: 'python',
  ts: 'typescript',
  yaml: 'yaml',
}

export function prismLanguageMapper(fileName) {
  const sanitizedFile = sanitize(fileName)
  const fileExtension = sanitizedFile.split('.').pop()
  return prismSupportedLanguages[fileExtension] || undefined
}
