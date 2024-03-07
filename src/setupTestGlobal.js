// Prevent timezone differences between local and CI/CD
module.exports = async () => {
  process.env.TZ = 'UTC'
}

process.env.REACT_APP_ZOD_IGNORE_TESTS = 'true'
