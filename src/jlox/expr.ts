import Token from './token';
import * as Stmt from './stmt';

export interface Visitor<R> {
  visitAssignExpr(expr: Assign): R;
  visitUnaryExpr(expr: Unary): R;
  visitBinaryExpr(expr: Binary): R;
  visitTernaryExpr(expr: Ternary): R;
  visitCallExpr(expr: Call): R;
  visitFunctionExpr(expr: Function): R;
  visitGetExpr(expr: Get): R;
  visitGroupingExpr(expr: Grouping): R;
  visitLiteralExpr(expr: Literal): R;
  visitTagExpr(expr: Tag): R;
  visitLogicalExpr(expr: Logical) :R;
  visitSetExpr(expr: Set);
  visitSuperExpr(expr: Super): R;
  visitThisExpr(expr: This): R;
  visitCommaExpr(expr: Comma): R;
  visitVariableExpr(expr: Variable): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: Visitor<R>): R;
}

export class Binary extends Expr {
  left: Expr;
  operator: Token;
  right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitBinaryExpr(this);
  }
}

export class Ternary extends Expr {
  condition: Expr;
  leftExpr: Expr;
  rightExpr: Expr;

  constructor(condition: Expr, leftExpr: Expr, rightExpr: Expr) {
    super();
    this.condition = condition;
    this.leftExpr = leftExpr;
    this.rightExpr = rightExpr;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitTernaryExpr(this);
  }
}


export class Grouping extends Expr {
  expression: Expr

  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitGroupingExpr(this);
  }
}

export type LiteralType = string | number | boolean;
export class Literal extends Expr {
  value: LiteralType;

  constructor(value: LiteralType) {
    super();
    this.value = value;
  }


  accept<R>(visitor: Visitor<R>) {
    return visitor.visitLiteralExpr(this);
  }
}

export class Tag extends Expr {
  key: string;

  constructor(key: string) {
    super();
    this.key = key;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitTagExpr(this);
  }
}

export class Unary extends Expr {
  operator: Token;
  right: Expr;

  constructor(operator: Token, right: Expr) {
    super();
    this.operator = operator;
    this.right = right;
  }


  accept<R>(visitor: Visitor<R>) {
    return visitor.visitUnaryExpr(this);
  }
}

export class Comma extends Expr {
  value: Expr;
  right: Expr;

  constructor(value: Expr, right: Expr) {
    super();
    this.value = value;
    this.right = right;
  }


  accept<R>(visitor: Visitor<R>) {
    return visitor.visitCommaExpr(this);
  }
}

export class Variable extends Expr {
  name: Token;
  constructor(name: Token) {
    super();
    this.name = name;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVariableExpr(this);
  }
}

export class Assign extends Expr {
  name: Token;
  value: Expr;
  constructor(name: Token, value: Expr) {
    super();
    this.name = name;
    this.value = value;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAssignExpr(this);
  }
}

export class Logical extends Expr {
  left: Expr;
  operator: Token;
  right: Expr;
  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLogicalExpr(this);
  }

}

export class Call extends Expr {
  callee: Expr;
  paren: Token;
  args: Expr[];

  constructor(callee: Expr, paren: Token, args: Expr[]) {
    super();
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }

  accept<R> (visitor: Visitor<R>): R {
    return visitor.visitCallExpr(this);
  }
}

export class Function extends Expr {
  name: string;
  params: Token[];
  body: Stmt.Stmt[];

  constructor(name: string, params: Token[], body: Stmt.Stmt[]) {
    super();
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept<R> (visitor: Visitor<R>): R {
    return visitor.visitFunctionExpr(this);
  }
}

export class Get extends Expr {
  object: Expr;
  name: Token;
  constructor(object: Expr, name: Token) {
    super();
    this.object = object;
    this.name = name;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitGetExpr(this);
  }
}

export class Set extends Expr {
  object: Expr;
  name: Token;
  value: Expr;
  constructor(object: Expr, name:  Token, value: Expr) {
    super();
    this.object = object;
    this.name = name;
    this.value = value;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitSetExpr(this);
  }
}

export class This extends Expr {
  keyword: Token;

  constructor(keyword: Token) {
    super();
    this.keyword = keyword;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitThisExpr(this);
  }
}

export class Super extends Expr {
  keyword: Token;
  method: Token;
  constructor(keyword: Token, method: Token) {
    super();
    this.keyword = keyword;
    this.method = method;
  }

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitSuperExpr(this);
  }

}