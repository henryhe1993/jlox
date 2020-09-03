import * as Expr from './expr';
import Token from './token';

export interface Visitor<R> {
  visitBlockStmt(stmt: Block): R;
  // R visitClassStmt(Class stmt);
  visitExpressionStmt(stmt: Expression): R;
  // R visitFunctionStmt(Function stmt);
  // R visitIfStmt(If stmt);
  visitPrintStmt(stmt: Print): R;
  // R visitReturnStmt(Return stmt);
  visitVarStmt(stmt: Var): R;
  // R visitWhileStmt(While stmt);
}

export abstract class Stmt {
  abstract accept<R>(visitor: Visitor<R> ): R;
}

export class Expression extends Stmt {
  expression: Expr.Expr;

  constructor(expression: Expr.Expr) {
    super();
    this.expression = expression;
  }

  accept<R>(visitor: Visitor<R> ): R {
    return visitor.visitExpressionStmt(this);
  }

}

export class Var extends Stmt {
  name: Token;
  initializer: Expr.Expr;

  constructor(name: Token, initializer: Expr.Expr = null) {
    super();
    this.name = name;
    this.initializer = initializer;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVarStmt(this);
  }

  
}

export class Print extends Stmt {
  expression: Expr.Expr;

  constructor(expression: Expr.Expr) {
    super();
    this.expression = expression;
  }

  accept<R>(visitor: Visitor<R> ): R {
    return visitor.visitPrintStmt(this);
  }
}

export class Block extends Stmt {
  statements: Stmt[];

  constructor(statements: Stmt[]) {
    super();
    this.statements = statements;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBlockStmt(this);
  }
}