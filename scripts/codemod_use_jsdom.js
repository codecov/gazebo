// npx jscodeshift -t scripts/codemod_use_jsdom.js <target glob>

export default function transformer(file, api) {
  const j = api.jscodeshift

  return j(file.source)
    .find(j.ImportDeclaration)
    .filter((path) => path.value.source.value === '@testing-library/react')
    .insertBefore(
      j.importDeclaration([], j.stringLiteral('@testing-library/jest-dom'))
    )
    .toSource()
}
