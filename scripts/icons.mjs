import _ from 'lodash'

import fs from 'fs'

import { enabledIcons, oldIcons } from './icon-list.mjs'

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
      return `import ${nameIcon} from './${icon}.svg?react'`
    })
  } else {
    lines = files.map((i) => {
      const fileName = i.slice(0, -4)
      const nameIcon = _.camelCase(fileName)
      const commented = enabledIcons.includes(fileName) ? '' : '// '
      if (enabledIcons.includes(fileName)) {
        names.push(nameIcon)
      }
      return `${commented}import ${nameIcon} from './${i}?react'`
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
generateImports('./src/old_ui/Icon/svg', oldIcons)

console.log('[icon gen]: done')
