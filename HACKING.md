# Working on charmhub.io

## Development environment

Use [Workshop](https://ubuntu.com/workshop/docs/) for the supported development environment:

```bash
workshop launch
workshop run -- start
```

The setup hook installs Python dependencies into `.venv`, installs JavaScript dependencies from `yarn.lock`, and loads `.env` followed by optional `.env.local` overrides. Flask is available on port 8045 and Vite on port 5045. Use `workshop refresh` after dependency changes.

Use `workshop exec -- <command>` for arbitrary commands or `workshop shell` for an interactive shell.

### Native setup (without Workshop)

Install Python 3.14 (as specified in `.python-version`), Node.js 24 and Yarn, then:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
yarn install --immutable
set -a
. ./.env
if [ -f .env.local ]; then . ./.env.local; fi
set +a
yarn build
yarn start
```

Build assets before running Python tests. To serve built assets without Vite, use `ENVIRONMENT=production FLASK_DEBUG=0 yarn serve`.

## Use staging APIs

To use staging APIs locally you can add the following lines to an `.env.local` file:

```bash
DEVICEGW_URL=https://api.staging.snapcraft.io/
PUBLISHERGW_URL=https://api.staging.charmhub.io/
FLASK_LOGIN_URL=https://login.staging.ubuntu.com
```

## Using Sentry error tracker

For development purposes, visit https://sentry.io/signup/, signup and setup a project. By then you will have a sentry DSN string like:

```
https://<user>:<secret>@sentry.io/<project_id>
```

Create or update your `.env.local` file:

```
SENTRY_DSN=<DSN_FROM_ABOVE>
```

The application will be reporting errors to your `sentry.io` project from now on.

## Testing

After launching Workshop, run:

```bash
workshop run -- test                       # build + all unit tests and linting
workshop run -- yarn test-js               # JavaScript tests
workshop run -- yarn test-js path/to/file.test.tsx
workshop run -- build                      # required before Python tests
workshop run -- yarn test-python
workshop run -- yarn lint-js
workshop run -- yarn lint-scss
workshop run -- yarn lint-python
```

## Status checks and prometheus metrics

[Talisker](https://talisker.readthedocs.io/en/latest/) provides a bunch of useful status checks and metrics about the running application. Some of this information is sensitive and so to access it you need to run the site with your IP address mentioned in the `TALISKER_NETWORKS` variable.

Now visit http://127.0.0.1:8045/_status to see the endpoints provided by Talisker. Useful ones include:

- http://127.0.0.1:8045/_status/check - A basic check that the site is running
- http://127.0.0.1:8045/_status/metrics - The prometheus metrics for the application

## Working on Solutions

To test solutions locally against local solutions service backend, add this to your `.env.local`:

```
SOLUTIONS_API_BASE=http://localhost:5000/api
```

## Vite setup details
This project relies on Vite for processing and bundling TypeScript and SCSS source files; referencing these files and the resulting bundles in templates is done through a `vite_import` template function provided by the [Canonical Webteam Flask-Vite integration](https://github.com/canonical/canonicalwebteam.flask-vite) package. The extension is configured via `VITE_*` variables that get loaded into the Flask `app.config` object where the extension reads them from.
Files referenced via `vite_import` are automatically detected and added as entry points in the Vite config when running the build command.
