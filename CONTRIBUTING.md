# Contributing to Momentum SWELAB

## Workflow

1. Create a branch from `main` (`feature/`, `bugfix/`, or `hotfix/`)
2. Make changes and commit with clear messages (e.g., "Add user authentication", "Fix login validation (#95)")
3. Push and create a Pull Request
4. Get at least one approval before merging

## Coding Standards

**Python**: Follow PEP 8, use type hints and docstrings, keep functions focused.

**JavaScript/React**: Use functional components with hooks, meaningful names, extract shared styles to `client/src/styles/sharedStyles.js`, add ARIA labels.

**Organization**: Backend database operations in separate modules (`usersDatabase.py`, `projectsDatabase.py`, `hardwareDatabase.py`). Frontend organized by page in `pages/`.

## Pull Requests

- Describe what changed and why
- Include how to test
- Add screenshots for UI changes
- Keep PRs focused and small

## Testing

Test locally before submitting. Ensure no errors, functionality works, and forms validate properly.
