import Interpreter from './visitors/interpreter';

export default abstract class LoxCallable {
  abstract arity(): number;
  abstract call(interpreter: Interpreter, args: any[]): any;
}