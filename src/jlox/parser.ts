import Token, { TokenType } from './token';
import * as Expr from './expr';
import * as Stmt from './stmt';
import Logger from './logger';

export default class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Stmt.Stmt[] {
    const statements = [];
    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }

    return statements; 
  }

  private declaration(): Stmt.Stmt {
    try {
      if (this.match(TokenType.VAR)) return this.varDeclaration();
      
      return this.statement();
    } catch (error) {
      this.synchronize();
      return null;
    }
  }

  private statement(): Stmt.Stmt {
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.LEFT_BRACE)) return new Stmt.Block(this.block());

    return this.expressionStatement();
  }

  private printStatement(): Stmt.Stmt {
    const value = this.comma();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Stmt.Print(value);
  }

  private expressionStatement(): Stmt.Stmt {
    const expr = this.comma();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return new Stmt.Expression(expr);
  }

  private block(): Stmt.Stmt[] {
    const statements: Stmt.Stmt[] = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  private varDeclaration(): Stmt.Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

    let initializer: Expr.Expr = null;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return new Stmt.Var(name, initializer);
  }


  private comma(): Expr.Expr {
    let expr = this.expression();
    while (this.match(TokenType.COMMA)) 
      expr = new Expr.Comma(expr, this.comma());
    return expr;
  }

  private expression(): Expr.Expr  {
    let expr = this.assignment();

    // right-associative ternary
    while (this.match(TokenType.QUESTION_MARK)) {
      const leftExpr = this.expression();
      if (!this.match(TokenType.COLON)) {
        throw this.error(this.peek(), 'Expect a colon.');
      }
      const rightExpr = this.expression();
      expr = new Expr.Ternary(expr, leftExpr, rightExpr);
    }
    

    return expr;
  }

  private assignment(): Expr.Expr {
    const expr = this.equality();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();
      if (expr instanceof Expr.Variable) {
        const name = expr.name;
        return new Expr.Assign(name, value);
      }

      this.error(equals, "Invalid assignment target."); 
    }

    return expr;
  }

  private equality(): Expr.Expr {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right = this.comparison();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr.Expr {
    let expr = this.addition();

    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = this.previous();
      const right = this.addition();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private addition(): Expr.Expr {
    let expr = this.multiplication();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.multiplication();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private multiplication(): Expr.Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr.Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Expr.Unary(operator, right);
    }

    return this.primary();
  }


  private primary(): Expr.Expr {
    if (this.match(TokenType.FALSE)) return new Expr.Literal(false);
    if (this.match(TokenType.TRUE)) return new Expr.Literal(true);
    if (this.match(TokenType.NIL)) return new Expr.Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Expr.Literal(this.previous().literal);
    }
    if (this.match(TokenType.IDENTIFIER)) {
      return new Expr.Variable(this.previous());
    }
    if (this.match(TokenType.TAG)) {
      return new Expr.Literal(this.previous().lexeme);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      let expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, `Expect ')' after expression.`);
      return new Expr.Grouping(expr);
    }

    throw this.error(this.peek(), `Expect expression.`);
  }

  private match(...types: TokenType[]): boolean {
    for (let type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type == TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private error(token: Token, message: string): Error {
    Logger.errorMsg(token, message);
    return new Error(message);
  }

  private synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type == TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }
}