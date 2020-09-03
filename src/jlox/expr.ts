import Token from './token';

export interface Visitor<R> {
  visitAssignExpr(expr: Assign): R;
  visitBinaryExpr(expr: Binary): R;
  visitTernaryExpr(expr: Ternary): R;
  // R visitCallExpr(Call expr);
  // R visitGetExpr(Get expr);
  visitGroupingExpr(expr: Grouping): R;
  visitLiteralExpr(expr: Literal): R;
  // R visitLogicalExpr(Logical expr);
  // R visitSetExpr(Set expr);
  // R visitSuperExpr(Super expr);
  // R visitThisExpr(This expr);
  visitUnaryExpr(expr: Unary): R;
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