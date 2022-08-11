export class RequestError extends Error {
  status: number;

  constructor(message: string, code: number) {
    super(message); // 'Error' breaks prototype chain here
    this.status = code;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
