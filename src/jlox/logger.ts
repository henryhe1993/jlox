import { Loc } from './interfaces';
import Token from './token';
import { RuntimeError } from './error/runtime-error';

export default {
  hadRuntimeError: false,
  error: function([l1, l2 = l1]: [Loc, Loc?]) {
    throw new Error(JSON.stringify({start: l1.start, end: l2.end}));
  },
  errorMsg: function(token: Token, msg: string) {
    console.error(msg, `line: ${token.loc.line}, start column: ${token.loc.start}, end column: ${token.loc.end}`);
  },
  runtimeError(error: RuntimeError) {
    console.log(error + "\n[line " + error.token.loc.line + "]");
    this.hadRuntimeError = true;
  }
}

