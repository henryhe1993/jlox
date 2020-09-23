import React from 'react';
import * as Expr from '../jlox/expr';
import AstPrinter from '../jlox/visitors/ast-printer';
import RPNGenerator from '../jlox/visitors/rpn-generator';
import Token, { TokenType } from '../jlox/token';
import { Loc } from '../jlox/interfaces';
import Scanner from '../jlox/scanner';
import Parser from '../jlox/parser';
import Interpreter from '../jlox/visitors/interpreter';
import Resolver from '../jlox/visitors/resolver';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-github";

const rawInput = 
`class Doughnut {
  cook() {
    print "Fry until golden brown.";
  }
}

class BostonCream < Doughnut {
  cook() {
    super.cook();
    print "Pipe full of custard and coat with chocolate.";
  }
}

BostonCream().cook();`;

const interpreter = new Interpreter();
export default function() {
  const [error, setError] = React.useState('');
  const [value, setValue] = React.useState('');
  const inputArea = React.useRef(null as HTMLPreElement);

  
  const [codeInput, setCodeInput] = React.useState(rawInput);
  const handleCompile = React.useCallback(() => {
    const interpreter = new Interpreter();
    console.log('------------compiling & running------------')
    const scanner = new Scanner(codeInput);
    const tokens = scanner.scanTokens();
    console.log('tokens: ', tokens)
    const statements = new Parser(tokens).parse();
    console.log('statements: ', statements)
    const resolver = new Resolver(interpreter);
    resolver.resolve(statements);
    console.log('------------interpreting------------')
    interpreter.interpret(statements);
    console.log('------------running finish------------')
  }, [codeInput]);

  React.useEffect(() => {
    try {
      const scanner = new Scanner(codeInput);
      const tokens = scanner.scanTokens();
      // console.log('tokens:', tokens);
      const statements = new Parser(tokens).parse();
      const resolver = new Resolver(interpreter);
      resolver.resolve(statements);
      interpreter.interpret(statements);
      // console.log('parsed expr', expr);
      // if (expr) {
      //   console.log('astPrinter', new AstPrinter().print(expr));
      //   console.log('reverse polish notation', new RPNGenerator().getRPN(expr))
      // }
      // interpreter.interpret(expr)
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
      <button style={{marginBottom: 20}} onClick={handleCompile}>
        compile & run
      </button>
      <AceEditor
        theme="github"
        height="80vh"
        onChange={setCodeInput}
        name="editor"
        mode="markdown"
        value={codeInput}
        editorProps={{ $blockScrolling: true }}
      />
      {/* {error && (
        <p>Error: {error}</p>
      ) || (
        <div>
          <p>SUCCESS: </p>
          <p>caluculated value: {value}</p>
        </div>
      )} */}
    </div>
  )
}




