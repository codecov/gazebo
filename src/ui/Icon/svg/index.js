const _ = require('lodash')
const fs = require('fs')

function generateImports(path) {
  const files = fs.readdirSync(path).filter((name) => name.endsWith('.svg'))

  files.forEach((i) => {
    const nameIcon = _.camelCase(i.slice(0, -4))
    const string = `export { ReactComponent as ${nameIcon} } from './${i}'`
    console.log(string)
  })
}

generateImports('./outline')
