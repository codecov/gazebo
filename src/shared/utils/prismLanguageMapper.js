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
  const fileExtension = fileName.split('.').pop()
  return fileExtension in prismSupportedLanguages
    ? prismSupportedLanguages[fileExtension]
    : undefined
}
