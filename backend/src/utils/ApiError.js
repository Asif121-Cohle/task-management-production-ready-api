export class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'API_ERROR', details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}
