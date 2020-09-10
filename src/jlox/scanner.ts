import Token, { TokenType } from './token';
import Logger from './logger';

const keywords = new Map<string, TokenType>();
keywords.set('and', TokenType.AND);
keywords.set('class', TokenType.CLASS);
keywords.set('else', TokenType.ELSE);
keywords.set('false', TokenType.FALSE);
keywords.set('for', TokenType.FOR);
keywords.set('fun', TokenType.FUN);
keywords.set('if', TokenType.IF);
keywords.set('nil', TokenType.NIL);
keywords.set('or', TokenType.OR);
keywords.set('print', TokenType.PRINT);
keywords.set('return', TokenType.RETURN);
keywords.set('super', TokenType.SUPER);
keywords.set('this', TokenType.THIS);
keywords.set('true', TokenType.TRUE);
keywords.set('var', TokenType.VAR);
keywords.set('while', TokenType.WHILE);
keywords.set('break', TokenType.BREAK);

export default class Scanner {
  private source: string;
  private tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;
  private colS: number = 1;
  private colE: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.colS = this.colE;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, '', null, {line: this.line, start: this.colS, end: this.colE}));
    return this.tokens;
  }

  private scanToken() {
    const c = this.advance();
    switch (c) {
      case '?': this.addToken(TokenType.QUESTION_MARK); break;
      case ':': this.addToken(TokenType.COLON); break;
      case '(': this.addToken(TokenType.LEFT_PAREN); break;
      case ')': this.addToken(TokenType.RIGHT_PAREN); break;
      case '{': this.addToken(TokenType.LEFT_BRACE); break;
      case '}': this.addToken(TokenType.RIGHT_BRACE); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case '.': this.addToken(TokenType.DOT); break;
      case '-': this.addToken(TokenType.MINUS); break;
      case '+': this.addToken(TokenType.PLUS); break;
      case ';': this.addToken(TokenType.SEMICOLON); break;
      case '*': this.addToken(TokenType.STAR); break;
      case '!': this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break;
      case '=': this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
      case '<': this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
      case '>': this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
      case '/': {
        if (this.match('/')) {
          while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      }
      case ' ':
      case '\r':
      case '\t':
        break;

      case '\n':
        this.line++;
        this.colS = 1;
        this.colE = 1;
        break;
      case '"': this.string(); break;
      case "'": this.tag(); break;
      
      default: {
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          Logger.error([{line: this.line, start: this.start, end: this.current}]);
        }
      }
    }
  }

  private isAtEnd() {
    return this.current >= this.source.length;
  }

  private advance() {
    this.current++;
    this.colE++;
    return this.source.charAt(this.current - 1);
  }

  private addToken(type: TokenType, literal: string | number = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, {line: this.line, start: this.colS, end: this.colE}));
  }

  private match(expected: string) {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) != expected) return false;
    this.colE++;
    this.current++;
    return true;
  }

  private peek() {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  private string() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') {
        this.line++;
        this.colS = 1;
        this.colE = 1;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      throw ('Unterminated string.');
    }

    this.advance();

    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private tag() {
    while (this.peek() != "'" && !this.isAtEnd()) {
      if (this.peek() == '\n') {
        this.colS = 1;
        this.colE = 1;
        this.line++;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      throw ('Unterminated tag.');
    }

    this.advance();
    const value = this.source.substring(this.start + 1, this.current - 1)
    this.addToken(TokenType.TAG, value);
  }

  private isDigit(c: string) {
    return c >= '0' && c <= '9';
  } 

  private number() {
    while (this.isDigit(this.peek())) this.advance();

    if (this.peek() == '.' && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(TokenType.NUMBER, +this.source.substring(this.start, this.current));
  }

  private peekNext() {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    let type = keywords.get(text);
    if (type == null) type = TokenType.IDENTIFIER;
    this.addToken(type);
  }

  private isAlpha(c: string) {
    return /[a-zA-Z_]/.test(c);
  }

  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }
}