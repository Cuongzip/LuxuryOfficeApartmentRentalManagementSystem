Always consult files in the agent-skills directory before generating code.

Relevant skills:

- agent-skills/expressjs-development/SKILL.md
- agent-skills/prisma/SKILL.md

Follow the conventions and business rules defined in those files.

Before implementing any feature:
1. Read docs/UseCaseSpecification.md.
2. Follow the business rules described in that document.
3. If implementation conflicts with the document, ask for clarification.

# Project structure

```
api/
  prisma/
    schema.prisma
    migrations/
  src/
    index.js              # bootstrap: listen + graceful shutdown
    app.js                # express app, global middleware, mount routes
    config/
      database.js         # PrismaClient singleton
    middlewares/
      errorHandler.js
      notFound.js
    routes/
      index.js            # register all routers
      site.js             # single/simple routes (home, health)
      auth.js             # one file per feature when route count is small
      admin/              # folder when a domain has many route files
        index.js          # mounts admin sub-routers
        users.js
    controllers/
    services/
    validators/
    utils/
    resources/
      public/
```

## Routes convention

- Do **not** use `routes/v1/` versioning folders unless explicitly requested.
- `routes/site.js`: few public routes (home, health).
- `routes/auth.js`: auth feature in one file when moderate size.
- `routes/admin/`: group many admin routes; `admin/index.js` mounts child routers.
- `routes/index.js` only wires routers to paths, no business logic.

Example mount in `routes/index.js`:

```javascript
app.use("/", siteRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
```

## Code Understanding

Before making changes:

1. Read related routes.
2. Read related controllers.
3. Read related services.
4. Read related Prisma models.

Do not implement changes until the relevant code has been inspected.

## 4. Code Changes

- Do not modify unrelated files.
- Keep changes scoped to the current task only.
- Avoid refactoring unless explicitly requested.

---

## 5. Debugging

- Prefer fixing root cause instead of adding temporary patches.
- Do not leave debug logs in production code.
- Remove console logs before committing.

---

## 6. API & Backend Rules

- Maintain backward compatibility unless migration is specified.
- Validate all inputs at API boundary.
- Keep business logic in `services/`, not in controllers or routes.
- Wrap async route handlers with `utils/asyncHandler.js`.
- Throw `utils/AppError.js` for operational errors.

---

## 7. Database Rules (SQL Server / Prisma)

- Stack: Prisma + SQL Server.
- Do not modify schema without explicit instruction.
- All schema changes must be backward compatible.
- Use `prisma migrate dev` for schema changes.

---

## 8. Agent Behavior Rules

- Always prioritize correctness over speed.
- If requirements are unclear, ask before implementing.
- Do not assume missing business logic.
- Do not hallucinate APIs or functions.

---

## 9. Output Discipline

- Only output final solution, not intermediate reasoning.
- Do not explain code unless asked.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

# AGENT CODING RULES

## 1. Think Before Coding

Before implementing:

- Do not assume.
- State assumptions clearly.
- If something is unclear, ask before coding.
- If multiple interpretations exist, present them instead of choosing silently.
- Consider simpler approaches first.
- Surface trade-offs when needed.

---

## 2. Simplicity First

- Write clean, minimal code.
- Only implement what is requested.
- Do not add unnecessary features.
- Avoid unnecessary abstractions.
- Do not create flexibility/configuration without a real need.
- Avoid over-engineering.

Ask:
"Would a senior engineer consider this overcomplicated?"

---

## 3. Surgical Changes

When editing existing code:

- Change only what is necessary.
- Do not refactor unrelated code.
- Do not improve adjacent code, comments, or formatting unless required.
- Match the existing code style.
- Do not remove existing unused code unless requested.

When your changes create unused code:

- Remove imports, variables, or functions made unused by your changes.

Every changed line should directly relate to the request.

---

## 4. Code Style

- Use clear and self-explanatory variable and function names.
- Do not add comments unless explicitly required.
- Avoid unnecessary abstractions.
- Keep code simple and readable.

---

## 5. Development Workflow

Follow this flow:

1. Plan
2. Implement
3. Test
4. Finalize
5. Commit

For multi-step tasks:

- Break tasks into steps internally.
- Verify each step before finishing.

---

## 6. Goal-Driven Execution

Define success criteria before completing a task.

Examples:

"Add validation"
→ Verify invalid inputs fail correctly.

"Fix a bug"
→ Reproduce the issue → fix → verify.

"Refactor"
→ Ensure behavior works before and after.

---

## 7. Commit Rules

- Do NOT commit after every function or small change.
- Only commit when a feature is complete and working.
- Never commit WIP (Work In Progress) code.
- Each commit must represent a complete, testable unit of work.
- Commit messages must clearly describe the feature or fix.

Examples:

feat: implement user authentication flow

fix: resolve login token expiration issue


**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
