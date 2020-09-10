import * as Expr from '../expr';
import TagDataSource from '../tag';

export default class implements Expr.Visitor<string> {
  print(expr: Expr.Expr) {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Expr.Binary) {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  // FIXME:
  visitTernaryExpr(expr: Expr.Ternary) {
    return this.parenthesize('?', expr.condition, expr.leftExpr, expr.rightExpr);
  }

  visitGroupingExpr(expr: Expr.Grouping) {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: Expr.Literal) {
    if (expr.value == null) return "nil";
    return expr.value.toString();
  }

  visitTagExpr(expr: Expr.Tag) {
    return TagDataSource[expr.key];
  }

  visitUnaryExpr(expr: Expr.Unary) {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }
  
  // TODO:
  visitVariableExpr(expr: Expr.Variable) {
    return ''
  }

  // TODO:
  visitAssignExpr(expr: Expr.Assign) {
    // return expr.value.accept<string>(this);
    return ''
  }

  // TODO:
  visitCommaExpr(expr: Expr.Comma) {
    return '';
  }

  // TODO:
  visitLogicalExpr(expr: Expr.Logical) {
    return '';
  }

  // TODO:
  visitCallExpr(expr: Expr.Call) {
    return '';
  }

  // TODO:
  visitFunctionExpr(expr: Expr.Function) {
    return '';
  }

  // TODO:
  visitGetExpr(expr: Expr.Get) {
    return '';
  }

   // TODO:
   visitSetExpr(expr: Expr.Set) {
    return '';
  }

   // TODO:
   visitThisExpr(expr: Expr.This) {
    return '';
  }

  // TODO:
  visitSuperExpr(expr: Expr.Super) {
    return '';
  }

  private parenthesize(name: String, ...exprs: Expr.Expr[]) {
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