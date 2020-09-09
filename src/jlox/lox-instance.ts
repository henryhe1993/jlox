import LoxClass from './lox-class';
import Token from './token';
import { RuntimeError } from './error/runtime-error';
import LoxFunction from './lox-function';

export default class LoxInstance {
  private klass: LoxClass;
  private fields: Map<string, any> = new Map();

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  get(name: Token): any {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme);
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method != null) return method.bind(this);
    
    throw new RuntimeError(name, 
        "Undefined property '" + name.lexeme + "'.");
  }

  set(name: Token, value: any) {
    this.fields.set(name.lexeme, value);
  }

  toString(): string {
    return this.klass.name + " instance";
  }
}