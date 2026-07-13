# AGENTS.md

This file provides guidance to agents when working with code in this repository.

charmhub.io is the web application for Charmhub. A charm is an operator package
with metadata that supports standard configuration, operation, and integration
across Juju deployments. This repo is a stateless Flask application hosted on
Charmed Kubernetes, serving Jinja templates with React 19 / TypeScript islands
bundled by Vite 7 and styled with Vanilla Framework.

## Running commands

Everything should run through `dotrun` for local development so commands use the
same containerized environment as the app.

```bash
dotrun                                          # Run the app on http://127.0.0.1:8045
dotrun -p 5045:5045                            # macOS/Windows: expose the Vite dev server
dotrun build                                   # Build frontend assets, as CI does
dotrun exec yarn build                         # Build frontend assets via the yarn script
dotrun test                                    # Full suite through dotrun
```

Yarn scripts should be invoked through `dotrun exec yarn <script>` during local
agent work:

```bash
dotrun exec yarn test-js                       # Vitest unit tests
dotrun exec yarn test-python                   # Python unittest suite
dotrun exec yarn test-e2e                      # Cypress; start the app first
dotrun exec yarn lint-python                   # Ruff lint for webapp and tests
dotrun exec yarn lint-js                       # ESLint for static/js/src
dotrun exec yarn lint-scss                     # Stylelint for SCSS
dotrun exec yarn format-python                 # Ruff format for webapp and tests
dotrun exec yarn check-prettier                # Prettier check for JS files
```

Build assets before validating Flask behavior after frontend or template changes.
Cypress tests expect the site to be running, matching CI's pattern of building
assets, starting `dotrun`, then running the e2e suite.

## Architecture

The Flask backend lives in `webapp/`. `webapp/app.py` defines the module-level
`FlaskBase` application named `charmhub.io`. It imports `webapp.config` first so
environment variables are loaded before app setup, then wires request handlers,
CSRF, Vite integration, Jinja filters/globals, and OpenTelemetry instrumentation.

Routes are organized by blueprint and feature area:

- `webapp/store/` - public charm directory pages.
- `webapp/publisher/` - publisher dashboard and charm management flows.
- `webapp/login/` - Ubuntu login integration.
- `webapp/search/` - charm search.
- `webapp/integrations/` - charm integration pages.
- `webapp/solutions/` - Juju solution pages and solution APIs.
- `webapp/topics/` - topic pages.
- `webapp/packages/` - package-related store routes.

Shared backend utilities include `webapp/store_api.py` for Publisher Gateway
access, `webapp/helpers.py` for template/data helpers, and `webapp/decorators.py`
for auth-related decorators. Match the nearby domain module before introducing a
new helper or abstraction.

Frontend source lives under `static/js/src/`:

- `base/` - layout and shared page behavior.
- `store/` - charm listing and store UI.
- `publisher-admin/` - publisher tools.
- `search/` - search interface.
- `solutions/` - solution views.
- `interfaces/` - charm interface pages.
- `shared/` - reusable utilities and components.
- `test-utils/` - frontend testing helpers.

The frontend uses React 19, React Router, React Query, Jotai where already
present, TypeScript, Vitest, Testing Library, and MSW-style test utilities where
available. Match the state and data-fetching pattern in the surrounding module
instead of introducing a new one.

## Templates and Vite

Jinja templates in `templates/` reference frontend entries through
`vite_import(...)`. `vitePluginDetectInput.js` scans `templates/**/*.html` and
adds those imports as Vite build entry points. Adding a new JS or TS island
usually means adding a `vite_import(...)` call to the template rather than
manually editing Vite inputs.

Vite config lives in `vite.config.js`. The dev server must be reachable by Flask
on port `5045` when running through dotrun on macOS or Windows.

## Conventions

- Prefer Vanilla Framework, `@canonical/react-components`, and
  `@canonical/store-components` before building custom UI.
- Keep Python formatted and linted with Ruff.
- Keep TypeScript strict and follow the local React patterns in each module.
- Put Python tests under `tests/`; keep frontend tests colocated with the code
  under `static/js/src/` when that is the local pattern.
- Do not edit generated files in `static/js/dist/`.
- Keep changes focused on the feature area touched by the task.

## Local development requiring credentials

Staging APIs, Ubuntu login, Sentry, and the local solutions backend can require
values in `.env.local`. See `HACKING.md` for the current variables and setup
details. Do not commit local credentials.

## External packages and libraries

The frontend uses Vanilla Framework for layout and components. Use the framework
docs and existing project examples when adding or changing UI.

The local development tool is `dotrun`, which provides the app's containerized
development environment.

## Workflow

1. Read the nearby implementation, tests, and any tool documentation needed for
   the change.
2. Make the smallest project-consistent change that addresses the task.
3. Add or update focused tests when behavior changes.
4. Run the narrowest relevant validation command first, then broaden as needed.
5. For frontend or template changes that affect Flask-rendered pages, build
   assets before validating the app.

## Additional links

- Code: https://github.com/canonical-web-and-design/charmhub.io
- Issues: https://github.com/canonical-web-and-design/charmhub.io/issues
- Pull requests: https://github.com/canonical-web-and-design/charmhub.io/pulls
- Actions: https://github.com/canonical-web-and-design/charmhub.io/actions
