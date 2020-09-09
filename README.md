# jlox

TS Implementation of Lox interpreter (Crafting Interpreters by Bob Nystrom)
with some differences.

Lox interpreter的TS实现.

A live editor that can modify code.
A button clicked to compile & run the code.

# Install

npm install

npm run start


# Additional Operators & Statements:

1. Support right associative ternary operator
2. Support comma operator
3. Support break statement
4. Support anonymous function expression

Differences:
1. Slightly different error handling
2. Partly use js coerion (TODO: More consistent coersion support)
3. 'Tag' (just for fun, surrounded by single quote('xxxx'))
