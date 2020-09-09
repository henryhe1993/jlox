import LoxCallable from './lox-callable';
import LoxInstance from './lox-instance';
import * as Stmt from './stmt';
import Interpreter from './visitors/interpreter';
import Environment from './environment';
import { Return } from './error/runtime-error';

export default class LoxFunction extends LoxCallable {
  private declaration: Stmt.Function;
  private closure: Environment;
  private isInitializer: boolean;

  constructor(declaration: Stmt.Function, closure: Environment, isInitializer: boolean) {
    super();
    this.isInitializer = isInitializer;
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
      if (this.isInitializer) return this.closure.getAt(0, "this");
      else return error.value;
    }
    if (this.isInitializer) return this.closure.getAt(0, "this");
    return null;
  }

  bind(instance: LoxInstance): LoxFunction {
    const environment: Environment = new Environment(this.closure);
    environment.define("this", instance);
    return new LoxFunction(this.declaration, environment, this.isInitializer);
  }

  toString(): string {
    return "<fn " + (this.declaration.name.lexeme || 'Anonymous') + ">";
  }
}