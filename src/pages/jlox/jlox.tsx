import React from 'react';
import * as Expr from './expr';
import AstPrinter from './visitors/ast-printer';
import RPNGenerator from './visitors/rpn-generator';
import Token, { TokenType } from './token';
import { Loc } from './interfaces';
import Scanner from './scanner';
import Parser from './parser';
import Interpreter from './visitors/interpreter';


const interpreter = new Interpreter();

export default function() {
  const [error, setError] = React.useState('');
  const [value, setValue] = React.useState('');
  const inputArea = React.useRef(null as HTMLPreElement);

  
  const rawInput = React.useMemo(() => {
    return (
      `1 + 2 + 3 + "AAA" + 4`
    )
  }, []);

  React.useEffect(() => {
    try {
      const scanner = new Scanner(rawInput);
      const tokens = scanner.scanTokens();
      console.log('tokens:', tokens);
      const expr = new Parser(tokens).parse();
      console.log('parsed expr', expr);
      if (expr) {
        console.log('astPrinter', new AstPrinter().print(expr));
        console.log('reverse polish notation', new RPNGenerator().getRPN(expr))
      }
      interpreter.interpret(expr)
    } catch(e) {
      console.log(e)
      // const msg: Loc = JSON.parse(e.message);
      setError(e.message);
    }

    // const expression = new Expr.Binary(
    //   new Expr.Unary(
    //     new Token(TokenType.MINUS, "-", null, {line: 1, start: 0, end: 1}),
    //     new Expr.Literal(123)
    //   ),
    //   new Token(TokenType.STAR, "*", null, {line: 1, start: 10, end:11}),
    //   new Expr.Grouping(new Expr.Literal(45.67))
    // );

    //   console.log(new AstPrinter().print(expression));

    // const expression = new Expr.Binary(
    //   new Expr.Binary(
    //     new Expr.Literal(1),
    //     new Token(TokenType.PLUS, "+", null, {line: 1, start: 0, end: 1}),
    //     new Expr.Literal(2)
    //   ),
    //   new Token(TokenType.STAR, "*", null, {line: 1, start: 10, end:11}),
    //   new Expr.Binary(
    //     new Expr.Literal(4),
    //     new Token(TokenType.MINUS, "-", null, {line: 1, start: 0, end: 1}),
    //     new Expr.Literal(3)
    //   ),
    // );
    // console.log(expression)
   
  }, []);

  return (
    <div>
      <pre ref={inputArea}>{rawInput}</pre>
      {error && (
        <p>Error: {error}</p>
      ) || (
        <div>
          <p>SUCCESS: </p>
          <p>caluculated value: {value}</p>
        </div>
      )}
    </div>
  )
}

