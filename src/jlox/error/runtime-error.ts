import Token from '../token';

export class RuntimeError extends Error {
  token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this.token = token;
  }
}

export class Return extends RuntimeError {
  value: any;

  constructor(value: any) {
    super(null, null);
    this.value = value;
  }
}