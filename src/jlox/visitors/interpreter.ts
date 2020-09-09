import * as Expr from '../expr';
import * as Stmt from '../stmt';
import Token, { TokenType } from '../token';
import Environment from '../environment';
import Logger from '../logger';
import { RuntimeError, Return } from '../error/runtime-error';
import TagDataSource from '../tag';
import LoxCallable from '../lox-callable';
import LoxFunction from '../lox-function';
import LoxClass from '../lox-class';
import LoxInstance from '../lox-instance';

enum ExitState {
  BREAK = 'BREAK'
}

export default class Interpreter implements Expr.Visitor<any>, Stmt.Visitor<void> {
  globals: Environment = new Environment();
  private environment: Environment = this.globals;
  private locals: Map<Expr.Expr, number> = new Map<Expr.Expr, number>();

  constructor() {
    this.globals.define("clock", new class extends LoxCallable {
      arity(): number { return 0; }

      call(interpreter: Interpreter, args: any[]): number {
        return Date.now();
      }

      toString(): String { return "<native fn>"; }
    });
  }

  resolve(expr: Expr.Expr, depth: number): void {
    this.locals.set(expr, depth);
  }

  interpret(statements: Stmt.Stmt[]) {
    try {
      for (let statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      Logger.runtimeError(error);
    }
  }

  // STATEMENT
  visitBlockStmt(stmt: Stmt.Block): void | ExitState {
    return this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitClassStmt(stmt: Stmt.Class): void {
    this.environment.define(stmt.name.lexeme, null);
    
    const methods: Map<string, LoxFunction> = new Map();
    for (let method of stmt.methods) {
      const fun = new LoxFunction(method, this.environment, method.name.lexeme === "init");
      methods.set(method.name.lexeme, fun);
    }

    const klass = new LoxClass(stmt.name.lexeme, methods);
    
    this.environment.assign(stmt.name, klass);
    return null;
  }

  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.evaluate(stmt.expression);
    return null; 
  }

  visitIfStmt(stmt: Stmt.If) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      return this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch != null) {
      return this.execute(stmt.elseBranch);
    }
    return null;
  }

  visitPrintStmt(stmt: Stmt.Print): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
    return null;
  }

  visitVarStmt(stmt: Stmt.Var): void {
    let value = null;
    if (stmt.initializer != null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
    return null;
  }

  visitWhileStmt(stmt: Stmt.While): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      const execution = this.execute(stmt.body);
      if (execution === ExitState.BREAK) break;
    }
    return null;
  }

  visitBreakStmt(stmt: Stmt.Stmt): ExitState.BREAK {
    return ExitState.BREAK;
  }

  visitFunctionStmt(stmt: Stmt.Function): void {
    const fun = new LoxFunction(stmt, this.environment, false);
    this.environment.define(stmt.name.lexeme, fun);
    return null;
  }

  visitReturnStmt(stmt: Stmt.Return) {
    let value = null;
    if (stmt.value != null) value = this.evaluate(stmt.value);
    
    throw new Return(value);
  }


  // EXPRESSION
  visitAssignExpr(expr: Expr.Assign): any {
    const value = this.evaluate(expr.value);
    const distance = this.locals.get(expr);
    if (distance != null) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }
    return value;
  }

  visitUnaryExpr(expr: Expr.Unary): any {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        return -right;
    }

    // Unreachable.
    return null;
  }

  visitBinaryExpr(expr: Expr.Binary): any {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right); 

    switch (expr.operator.type) {
      case TokenType.GREATER: {
        this.checkNumberOperands(expr.operator, left, right);
        return left > right;
      }
      case TokenType.GREATER_EQUAL: {
        this.checkNumberOperands(expr.operator, left, right);
        return left >= right;
      }
      case TokenType.LESS: {
        this.checkNumberOperands(expr.operator, left, right);
        return left < right;
      }
      case TokenType.LESS_EQUAL: {
        this.checkNumberOperands(expr.operator, left, right);
        return left <= right;
      }
      case TokenType.BANG_EQUAL: 
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL: 
        return this.isEqual(left, right);
      case TokenType.MINUS: {
        this.checkNumberOperands(expr.operator, left, right);
        return +left - +right;
      }
      case TokenType.PLUS: {
        if (typeof left === 'number' && typeof right === 'number') {
          return +left + +right;
        } 
        if (typeof left === 'string' || typeof right === 'string' ) {
          return left.toString() + right.toString();
        }
        throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");
      }
      case TokenType.SLASH: {
        this.checkNumberOperands(expr.operator, left, right);
        return +left / +right;
      }
      case TokenType.STAR: {
        this.checkNumberOperands(expr.operator, left, right);
        return +left * +right;
      }
    }

    // Unreachable.
    return null;
  }

  // FIXME:
  visitTernaryExpr(expr: Expr.Ternary): any {
    return this.evaluate(expr.condition) ? this.evaluate(expr.leftExpr) : this.evaluate(expr.rightExpr);
  }

  visitCallExpr(expr: Expr.Call): any {
    const callee = this.evaluate(expr.callee);

    const args: Expr.Expr[] = [];
    for (let arg of expr.args) { 
      args.push(this.evaluate(arg));
    }
    if (!(callee instanceof LoxCallable)) {
      throw new RuntimeError(expr.paren, "Can only call functions and classes.");
    }
    const fun: LoxCallable = callee;
    if (args.length !== fun.arity()) {
      throw new RuntimeError(expr.paren, "Expected " +
          fun.arity() + " arguments but got " +
          args.length + ".");
    }
    return fun.call(this, args);
  }

  visitGetExpr(expr: Expr.Get): any {
    const object = this.evaluate(expr.object);
    if (object instanceof LoxInstance) {
      return object.get(expr.name);
    }

    throw new RuntimeError(expr.name,
        "Only instances have properties.");
  }

  visitGroupingExpr(expr: Expr.Grouping): any {
    return this.evaluate(expr.expression);
  }

  visitLiteralExpr(expr: Expr.Literal): any {
    return expr.value;
  }

  visitTagExpr(expr: Expr.Tag): any {
    return TagDataSource[expr.key];
  }

  visitLogicalExpr(expr: Expr.Logical): any {
    const left = this.evaluate(expr.left);

    if (expr.operator.type == TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitSetExpr(expr: Expr.Set): any {
    const object = this.evaluate(expr.object);

    if (!(object instanceof LoxInstance)) { 
      throw new RuntimeError(expr.name, "Only instances have fields.");
    }

    const value = this.evaluate(expr.value);
    object.set(expr.name, value);
    return value;
  }

  visitThisExpr(expr: Expr.This): any {
    return this.lookUpVariable(expr.keyword, expr);
  }

  // FIXME:
  visitCommaExpr(expr: Expr.Comma) {
    this.evaluate(expr.value)
    return this.evaluate(expr.right);
  }

  visitVariableExpr(expr: Expr.Variable): any {
    return this.lookUpVariable(expr.name, expr);
  }

  visitFunctionExpr(expr: Expr.Function): LoxFunction {
    return new LoxFunction(
      new Stmt.Function(
        new Token(TokenType.FUN, expr.name, null, null), 
        expr.params, 
        expr.body
      ), 
      this.environment,
      false
    );
  }

  executeBlock(statements: Stmt.Stmt[], environment: Environment): void | ExitState {
    const previous = this.environment;
    let result: void | ExitState = null;
    try {
      this.environment = environment;
      for (let statement of statements) {
        result = this.execute(statement);
        if (result === ExitState.BREAK) {
          return result;
        }
      }
      return null;
    } finally {
      this.environment = previous;
    }
  }

  private execute(stmt: Stmt.Stmt): void | ExitState {
    return stmt.accept(this);
  }

  private evaluate(expr: Expr.Expr): any {
    return expr.accept(this);
  }

  private isTruthy(object: Object): boolean {
    return !!object;
  }

  private isEqual(a: any, b: any): boolean {
    return Object.is(a, b);
  }

  private checkNumberOperands(operator: Token, left: any, right: any) {
    if (!Number.isNaN(left) && !Number.isNaN(right)) return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  private stringify(object: any): string {
    if (object == null) return "nil";
    return object.toString();
  }

  private lookUpVariable(name: Token, expr: Expr.Expr): any {
    const distance = this.locals.get(expr);
    if (distance != null) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }
}