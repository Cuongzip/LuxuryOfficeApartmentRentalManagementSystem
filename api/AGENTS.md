Always consult files in the agent-skills directory before generating code.

Relevant skills:

- agent-skills/expressjs-development/SKILL.md
- agent-skills/prisma/SKILL.md

Follow the conventions and business rules defined in those files.

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
app.use('/', siteRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
```

# AGENT CODING RULES

## 1. Code Style

- Write clean, minimal code.
- Do not add comments unless explicitly required.
- Prefer self-explanatory variable and function names.
- Avoid unnecessary abstractions.

---

## 2. Commit Rules

- Do NOT commit after each function or small change.
- Only commit when a feature is fully complete and working.
- Never commit WIP (Work In Progress) code.
- Each commit must represent a complete, testable unit of work.
- Commit message must clearly describe the feature or fix.

Example:

- feat: implement user authentication flow
- fix: resolve login token expiration issue

---

## 3. Development Workflow

- Break tasks into steps internally, but do not commit per step.
- Follow this flow:
  1. Plan
  2. Implement
  3. Test
  4. Finalize
  5. Commit

---

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
