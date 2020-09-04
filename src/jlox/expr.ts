import Token from './token';

export interface Visitor<R> {
  visitAssignExpr(expr: Assign): R;
  visitUnaryExpr(expr: Unary): R;
  visitBinaryExpr(expr: Binary): R;
  visitTernaryExpr(expr: Ternary): R;
  visitCallExpr(expr: Call): R;
  // R visitGetExpr(Get expr);
  visitGroupingExpr(expr: Grouping): R;
  visitLiteralExpr(expr: Literal): R;
  visitTagExpr(expr: Tag): R;
  visitLogicalExpr(expr: Logical) :R;
  // R visitSetExpr(Set expr);
  // R visitSuperExpr(Super expr);
  // R visitThisExpr(This expr);
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