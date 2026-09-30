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
- Don't put in your own comments. All comments are instructions from me ONLY.
- Do NOT implement functions, add buttons, or add event handlers unless:
  - There are clear stub comments in the code (marked with TODO, FIXME, or similar)
  - The stub comments are in the format I specified (e.g., "// TODO: Implement saveLocalFile")
  - I explicitly tell you to implement them
- Do NOT add parentheses to onClick handlers (like onClick={() => { myFunction(); }}) unless explicitly requested
- ONLY implement what is explicitly stubbed in comments - no extra functionality


# Project Information:
- Database Schema in schema.sql (Use this for implementations of database operations in backend/src/db.ts)
- All frontend data schema updates should be just fine as we are pushing the whole object (minus secret key) to the database. 
- - However, when developing frontend code, try to make it as backward compatible as possible. I will try my hardest to make design choices that point us in this direction, but don't go with instructions if my design choices are not backward compatible.
- - Backend code MUST ALWAYS BE BACKWARD COMPATIBLE. Typically, only the getData and setData functions should need maintained, so just don't be stupid (like me).
