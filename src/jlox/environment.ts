import Token from './token';
import { RuntimeError } from './error/runtime-error';

export default class Environment {
  enclosing: Environment;
  private values: Map<string, any> = new Map();

  constructor(enclosing: Environment = null) {
    this.enclosing = enclosing;
  }

  get(name: Token): any {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }
    if (this.enclosing) return this.enclosing.get(name);
    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }

  define(name: string, value: object): void {
    this.values.set(name, value);
  }

  assign(name: Token, value: any): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }
    if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }
    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }
}