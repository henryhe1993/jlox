import * as Expr from './expr';
import * as Stmt from './stmt';
import Interpreter from './visitors/interpreter';
import Logger from './logger';
import Token from './token';

enum FunctionType {
  NONE,
  FUNCTION,
  INITIALIZER,
  METHOD
}

enum ClassType {
  NONE,
  CLASS
}

export default class Resolver implements Expr.Visitor<void>, Stmt.Visitor<void> {
  private interpreter: Interpreter;
  private scopes: Map<string, boolean>[] = [];
  private currentFunction: FunctionType = FunctionType.NONE;
  private currentClass: ClassType = ClassType.NONE;
  // Stack<Map<String, Boolean>>

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  // STATEMENT
  visitBlockStmt(stmt: Stmt.Block): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
    return null;
  }

  visitClassStmt(stmt: Stmt.Class): void {
    const enclosingClass = this.currentClass;
    this.currentClass = ClassType.CLASS;

    this.declare(stmt.name);
    this.define(stmt.name);

    this.beginScope();
    this.scopes[this.scopes.length - 1].set("this", true);

    for (let method of stmt.methods) {
      let declaration = FunctionType.METHOD;
      if (method.name.lexeme === "init") {
        declaration = FunctionType.INITIALIZER;
      }
      this.resolveFunction(method, declaration); 
    }
    this.endScope();
    this.currentClass = enclosingClass;
    return null;
  }

  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.resolveExpr(stmt.expression);
    return null; 
  }

  visitIfStmt(stmt: Stmt.If) {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.thenBranch);
    if (stmt.elseBranch != null) this.resolveStmt(stmt.elseBranch);
    return null;
  }

  visitPrintStmt(stmt: Stmt.Print): void {
    this.resolveExpr(stmt.expression);
    return null;
  }

  visitVarStmt(stmt: Stmt.Var): void {
    this.declare(stmt.name);
    if (stmt.initializer != null) {
      this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
    return null;
  }

  visitWhileStmt(stmt: Stmt.While): void {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.body);
    return null;
  }

  visitBreakStmt(stmt: Stmt.Stmt): void {
    return null
  }

  visitFunctionStmt(stmt: Stmt.Function): void {
    this.declare(stmt.name);
    this.define(stmt.name);
    
    this.resolveFunction(stmt, FunctionType.FUNCTION);
    return null;
  }

  visitReturnStmt(stmt: Stmt.Return): void {
    if (this.currentFunction == FunctionType.NONE) {
      Logger.errorMsg(stmt.keyword, "Cannot return from top-level code.");
    }
    if (stmt.value != null) {
      if (this.currentFunction == FunctionType.INITIALIZER) {
        Logger.errorMsg(stmt.keyword,
            "Cannot return a value from an initializer.");
      }
      this.resolveExpr(stmt.value);
    }
    return null;
  }

  // EXPRESSION
  visitAssignExpr(expr: Expr.Assign): void {
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
    return null;
  }

  visitUnaryExpr(expr: Expr.Unary): void {
    this.resolveExpr(expr.right);
    return null;
  }

  visitBinaryExpr(expr: Expr.Binary): void {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
    return null;
  }

  visitTernaryExpr(expr: Expr.Ternary): void {
    return null;
  }

  visitCallExpr(expr: Expr.Call): void {
    this.resolveExpr(expr.callee);

    for (let arg of expr.args) {
      this.resolveExpr(arg);
    }

    return null;
  }

  visitGetExpr(expr: Expr.Get): void {
    this.resolveExpr(expr.object);
    return null;
  }

  visitGroupingExpr(expr: Expr.Grouping): void {
    this.resolveExpr(expr.expression);
    return null;
  }

  visitLiteralExpr(expr: Expr.Literal): void {
    return null;
  }
  // TODO:
  visitTagExpr(expr: Expr.Tag): void {
    return null;
  }

  visitLogicalExpr(expr: Expr.Logical): void {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
    return null;
  }

  visitSetExpr(expr: Expr.Set): void {
    this.resolveExpr(expr.value);
    this.resolveExpr(expr.object);
    return null;
  }

  visitThisExpr(expr: Expr.This): void {
    if (this.currentClass == ClassType.NONE) {
      Logger.errorMsg(expr.keyword,
          "Cannot use 'this' outside of a class.");
      return null;
    }

    this.resolveLocal(expr, expr.keyword);
    return null;
  }

  // TODO:
  visitCommaExpr(expr: Expr.Comma): void {
    return null;
  }

  visitVariableExpr(expr: Expr.Variable): null {
    if (this.scopes.length &&
        this.scopes[this.scopes.length - 1].get(expr.name.lexeme) == false) {
      Logger.errorMsg(expr.name,
          "Cannot read local variable in its own initializer.");
    }

    this.resolveLocal(expr, expr.name);
    return null;
  }
  // TODO:
  visitFunctionExpr(expr: Expr.Function): void {
    return null;
  }

  resolve(statements: Stmt.Stmt[]): void {
    for (let statement of statements) {
      this.resolveStmt(statement);
    }
  }

  private resolveStmt(stmt: Stmt.Stmt): void {
    stmt.accept(this);
  }

  private resolveExpr(expr: Expr.Expr): void {
    expr.accept(this);
  }

  private resolveLocal(expr: Expr.Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }

    // Not found. Assume it is global.
  }

  private resolveFunction(fun: Stmt.Function, type: FunctionType): void {
    let enclosingFunction: FunctionType = this.currentFunction;
    this.currentFunction = type;
    this.beginScope();
    for (let param of fun.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(fun.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  private beginScope(): void {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  private declare(name: Token): void {
    if (!this.scopes.length) return;

    const scope = this.scopes[this.scopes.length - 1];
    if (scope.has(name.lexeme)) {
      Logger.errorMsg(name,
          "Variable with this name already declared in this scope.");
    }
    scope.set(name.lexeme, false);
  }

  private define(name: Token): void {
    if (!this.scopes.length) return;
    this.scopes[this.scopes.length - 1].set(name.lexeme, true);
  }
}