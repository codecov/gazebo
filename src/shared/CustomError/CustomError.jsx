class CustomError {
  constructor({ detail, status }) {
    this.data = { detail }
    this.status = status
  }
}

export default CustomError
