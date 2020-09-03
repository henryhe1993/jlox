import * as Expr from '../expr';

export default class RPNVisitor implements Expr.Visitor<string> {
  getRPN(expr: Expr.Expr) {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Expr.Binary) {
    return this.computeValue(expr.operator.lexeme, expr.left, expr.right)
  }
  // FIXME:
  visitTernaryExpr(expr: Expr.Ternary) {
    return this.computeValue('?', expr.condition, expr.leftExpr, expr.rightExpr)
  }

  visitGroupingExpr(expr: Expr.Grouping) {
    return this.computeValue('', expr.expression)
  }

  visitLiteralExpr(expr: Expr.Literal) {
    return this.computeValue(expr.value)
  }

  visitUnaryExpr(expr: Expr.Unary) {
    return this.computeValue(expr.operator.lexeme, expr.right)
  }

  computeValue(value: Expr.LiteralType, ...exprs: Expr.Expr[]) {
    let build = ``;
    for (let expr of exprs) {
      const output = this.getRPN(expr);
      build += output;
    }
    build += value;
    return build;
  }
}