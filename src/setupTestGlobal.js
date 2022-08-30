// Prevent timezone differences between local and CI/CD
module.exports = async () => {
  process.env.TZ = 'UTC'
}
