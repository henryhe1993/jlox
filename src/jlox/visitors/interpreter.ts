import * as Expr from '../expr';
import * as Stmt from '../stmt';
import Token, { TokenType } from '../token';
import Environment from '../environment';
import Logger from '../logger';
import { RuntimeError } from '../error/runtime-error';
import TagDataSource from '../tag';

enum ExitState {
  BREAK = 'BREAK'
}

export default class Interpreter implements Expr.Visitor<any>, Stmt.Visitor<void> {
  private environment: Environment = new Environment();

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

  // EXPRESSION
  visitAssignExpr(expr: Expr.Assign): any {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
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

  // FIXME:
  visitCommaExpr(expr: Expr.Comma) {
    this.evaluate(expr.right);
    return this.evaluate(expr.value);
  }

  visitVariableExpr(expr: Expr.Variable): any {
    return this.environment.get(expr.name);
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
}