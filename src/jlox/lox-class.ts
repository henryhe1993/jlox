import LoxCallable from './lox-callable';
import LoxInstance from './lox-instance';
import LoxFunction from './lox-function';
import Interpreter from './visitors/interpreter';

export default class LoxClass extends LoxCallable {
  name: string;
  private methods: Map<string, LoxFunction>;

  constructor(name: string, methods: Map<string, LoxFunction>) {
    super();
    this.name = name;
    this.methods = methods;
  }

  call(interpreter: Interpreter, args: any[]): any {
    const instance = new LoxInstance(this);
    const initializer = this.findMethod("init");
    if (initializer != null) {
      initializer.bind(instance).call(interpreter, args);
    }
    return instance;
  }

  findMethod(name: string): LoxFunction {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }

    return null;
  }

  arity(): number {
    const initializer = this.findMethod("init");
    if (initializer == null) return 0;
    return initializer.arity();
  }

  toString(): string {
    return this.name;
  }
}