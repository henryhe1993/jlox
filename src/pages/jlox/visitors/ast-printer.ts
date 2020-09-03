import { Visitor, Expr, Binary, Grouping, Literal, Unary, Ternary } from '../expr';

export default class implements Visitor<String> {
  print(expr: Expr) {
    return expr.accept(this);
  }

  public visitBinaryExpr(expr: Binary) {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  // FIXME:
  public visitTernaryExpr(expr: Ternary) {
    return this.parenthesize('?', expr.condition, expr.leftExpr, expr.rightExpr);
  }

  public visitGroupingExpr(expr: Grouping) {
    return this.parenthesize("group", expr.expression);
  }

  public visitLiteralExpr(expr: Literal) {
    if (expr.value == null) return "nil";
    return expr.value.toString();
  }

  public visitUnaryExpr(expr: Unary) {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(name: String, ...exprs: Expr[]) {
    let builder = '';

    builder += '(' + name;
    for (let expr of exprs) {
      builder += ' ';
      builder += expr.accept(this);
    }
    builder += ')';

    return builder;
  }
}