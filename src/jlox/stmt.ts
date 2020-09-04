import * as Expr from './expr';
import Token from './token';

export interface Visitor<R> {
  visitBlockStmt(stmt: Block): R;
  // R visitClassStmt(Class stmt);
  visitExpressionStmt(stmt: Expression): R;
  // R visitFunctionStmt(Function stmt);
  visitIfStmt(stmt: If): R;
  visitPrintStmt(stmt: Print): R;
  // R visitReturnStmt(Return stmt);
  visitVarStmt(stmt: Var): R;
  visitWhileStmt(stmt: While): R;
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

export class If extends Stmt {
  condition: Expr.Expr;
  thenBranch: Stmt;
  elseBranch: Stmt;
  
  constructor(condition: Expr.Expr, thenBranch: Stmt, elseBranch: Stmt) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitIfStmt(this);
  }
}

export class While extends Stmt {
  condition: Expr.Expr;
  body: Stmt;

  constructor(condition: Expr.Expr, body: Stmt) {
    super();
    this.condition = condition;
    this.body = body;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitWhileStmt(this);
  }
}