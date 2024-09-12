import _ from 'lodash'

import fs from 'fs'

const enabledIcons = [
  'flag',
  'chevron-up',
  'chevron-down',
  'search',
  'check',
  'x',
  'lock-closed',
  'globe-alt',
  'clipboard-copy',
  'external-link',
  'home',
  'merge',
  'pull-request-open',
  'pull-request-closed',
  'speakerphone',
  'exclamation',
  'branch',
  'refresh',
  'information-circle',
  'arrow-up',
  'arrow-down',
  'folder',
  'document',
  'document-text',
  'branch',
  'exclamation-circle',
  'exclamation-triangle',
  'ban',
  'chevron-left',
  'download',
  'chevron-right',
  'printer',
  'cog',
  'light-bulb',
  'no-symbol',
  'x-circle',
  'database',
  'trash',
  'book-open',
  'check-circle',
  'question-mark-circle',
  'plus-circle',
  'eye',
  'eye-off',
]

console.log('[icon gen]: starting')
// temp removing as we're going to be calling this a lot more
// console.log('Icons that will be generated: ')
// console.log(enabledIcons.join(', '))
// console.log('-----------')
// console.log('Edit this file to update the icon list')

function generateImports(path, oldIcons = []) {
  const files = fs.readdirSync(path).filter((name) => name.endsWith('.svg'))

  let names = []
  let lines = []
  if (oldIcons.length > 0) {
    lines = oldIcons.map((icon) => {
      const nameIcon = _.camelCase(icon)
      names.push(nameIcon)
      return `import { ReactComponent as ${nameIcon} } from './${icon}.svg'`
    })
  } else {
    lines = files.map((i) => {
      const fileName = i.slice(0, -4)
      const nameIcon = _.camelCase(fileName)
      const commented = enabledIcons.includes(fileName) ? '' : '// '
      if (enabledIcons.includes(fileName)) {
        names.push(nameIcon)
      }
      return `${commented}import { ReactComponent as ${nameIcon} } from './${i}'`
    })
  }

  const joinedLines = lines.join('\n')

  const exportLines = names.map((i) => i).join(', ')
  const exportDefault = `export { ${exportLines} }`
  const output = `${joinedLines}\n\n${exportDefault}`

  const nameFile = path + '/index.jsx'
  fs.writeFileSync(nameFile, output)
}

generateImports('./src/ui/Icon/svg/outline')
generateImports('./src/ui/Icon/svg/solid')
generateImports('./src/ui/Icon/svg/developer')

// this is the old icons and will be removed once the migration to vite is complete
generateImports('./src/old_ui/Icon/svg', [
  'angleDown',
  'angleUp',
  'arrowLeft',
  'ban',
  'check',
  'creditCard',
  'exclamationCircle',
  'infoCircle',
  'times',
  'chevronRight',
  'chevronLeft',
  'fileAlt',
  'hamburger',
  'setting',
  'signOut',
  'search',
])

console.log('[icon gen]: done')
