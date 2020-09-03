import * as Expr from '../expr';
import Token, { TokenType } from '../token';
import Logger from '../logger';
import { RuntimeError } from '../error/runtime-error';

export default class Interpreter implements Expr.Visitor<any> {
  interpret(expression: Expr.Expr) {
    try {
      console.log('evaluting expression', expression)
      const value = this.evaluate(expression);
      console.log('interpreted value', this.stringify(value));
    } catch (error) {
      // Logger.errorMsg(error);
    }
  }

  public visitLiteralExpr(expr: Expr.Literal): any {
    return expr.value;
  }

  public visitGroupingExpr(expr: Expr.Grouping): any {
    return this.evaluate(expr.expression);
  }

  public visitUnaryExpr(expr: Expr.Unary): any {
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

  public visitBinaryExpr(expr: Expr.Binary): any {
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