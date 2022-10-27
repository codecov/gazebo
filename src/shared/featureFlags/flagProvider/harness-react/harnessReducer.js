import camelCase from 'lodash/camelCase'

export default function harnessReducer(flags, action) {
  switch (action.type) {
    case 'updateFlag': {
      const formattedFlag = camelCase(action.flag)
      return {
        ...flags,
        flags: { ...flags.flags, ...{ [formattedFlag]: action.value } },
      }
    }
    case 'setupHarness': {
      return action.harness
    }
    default: {
      throw Error('Unknown action: ' + action.type)
    }
  }
}
