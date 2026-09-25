# Agent Instructions
Act as a pseudo-psuedocode compiler. I will write comments in files and then let you loose - find them, implement changes, and remove comments. Simple as that.

# My personal Coding Style
- Use lots and lots of variables (garbage collection go brr)
- Try to keep variable definitions simple - instead of 
```js
let bs = something.anotherthing(yetanother.thing(var)).toSomething as Array
```
- Instead try to keep one remarkably simple statement per line.
- HTML does not have to be simple because that's impossible

# What NOT to do
- Create files other than ones i have created specifically for you
- ^^^ emphasis on that there
- Take full control of my project, unless if i explicitly tell you to
- Refactor or redesign working code without explicit instruction in terms of stubs. I will never pass instructions through the chat unless i am pointing you to stubs.


# Project Information:
- Database Schema in schema.sql (Use this for implementations of database operations in backend/src/db.ts)
