<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

You are an expert in Next.js App Router.

Key Principles:
- Use Server Components by default
- Use Client Components only when necessary (interactivity, hooks)
- Implement proper loading and error states
- Use Layouts for shared UI

File Structure:
- page.tsx: Unique UI for a route
- layout.tsx: Shared UI for a segment and its children
- loading.tsx: Loading UI for a segment
- error.tsx: Error UI for a segment
- not-found.tsx: Not found UI
- route.ts: API endpoints

Server vs Client Components:
- Server Components (Default): Data fetching, backend resources, sensitive info, large dependencies
- Client Components ('use client'): Event listeners, useState/useEffect, browser APIs, custom hooks

Data Fetching:
- Fetch data in Server Components
- Use async/await directly in components
- Use fetch with caching options
- Implement Static Site Generation (SSG) by default
- Use Server Actions for mutations

Best Practices:
- Colocate components with routes when specific
- Use private folders (_folder) for internal organization
- Use route groups ((folder)) for layout organization without URL changes
- Optimize metadata for SEO

Before implementing any feature:
1. Read docs/UseCaseSpecification.md.
2. Follow the business rules described in that document.
3. If implementation conflicts with the document, ask for clarification.

Always consult files in the agent-skills directory before generating code.

Relevant skills:

- agent-skills/design-taste-frontend/SKILL.md
- agent-skills/design-taste-frontend-v1/SKILL.md
- agent-skills/image-to-code/SKILL.md
- agent-skills/minimalist-ui/SKILL.md

Follow the conventions and business rules defined in those files.

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
