// Prevent timezone differences between local and CI/CD
const setupTestGlobal = async () => {
  process.env.TZ = 'UTC'
}

export default setupTestGlobal

process.env.REACT_APP_ZOD_IGNORE_TESTS = 'true'
