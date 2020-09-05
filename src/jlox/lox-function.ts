import LoxCallable from './lox-callable';
import * as Stmt from './stmt';
import Interpreter from './visitors/interpreter';
import Environment from './environment';
import { Return } from './error/runtime-error';

export default class LoxFunction extends LoxCallable {
  private declaration: Stmt.Function;
  private closure: Environment;

  constructor(declaration: Stmt.Function, closure: Environment) {
    super();
    this.declaration = declaration;
    this.closure = closure;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: any[]): any {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (error) {
      if (!(error instanceof Return)) throw error;
      else return error.value;
        
    }

    return null;
  }

  toString(): string {
    return "<fn " + (this.declaration.name.lexeme || 'Anonymous') + ">";
  }
}