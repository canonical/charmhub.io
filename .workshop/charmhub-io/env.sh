# shellcheck shell=bash
# Shared environment for the `charmhub-io` workshop actions and SDK hooks.
#
# dotrun used to export `.env`/`.env.local` and put the project venv on PATH.
# Nothing does that automatically here, so actions source this file instead.

PROJECT_DIR=/project
cd "$PROJECT_DIR"

set -a
if [ -f "$PROJECT_DIR/.env" ]; then
  . "$PROJECT_DIR/.env"
fi
if [ -f "$PROJECT_DIR/.env.local" ]; then
  . "$PROJECT_DIR/.env.local"
fi
set +a

# Sourced by the actions AND by ~/.profile, so guard against PATH entries
# piling up in nested shells.
for _charmhub_dir in "$PROJECT_DIR/.venv/bin" "$PROJECT_DIR/node_modules/.bin"; do
  case ":$PATH:" in
    *":$_charmhub_dir:"*) ;;
    *) PATH="$_charmhub_dir:$PATH" ;;
  esac
done
unset _charmhub_dir
export PATH

# The node SDK ships Corepack; fall back to it when no yarn shim is on PATH.
# This has to be a real executable rather than a shell function: `yarn start`
# runs concurrently, which spawns `sh -c 'yarn run serve'`, and an exported
# bash function would not survive into that subshell.
if ! command -v yarn >/dev/null 2>&1; then
  CHARMHUB_IO_SHIM_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/charmhub-io-workshop/bin"
  mkdir -p "$CHARMHUB_IO_SHIM_DIR"
  if [ ! -x "$CHARMHUB_IO_SHIM_DIR/yarn" ]; then
    printf '#!/bin/bash\nexec corepack yarn "$@"\n' > "$CHARMHUB_IO_SHIM_DIR/yarn"
    chmod +x "$CHARMHUB_IO_SHIM_DIR/yarn"
  fi
  export PATH="$CHARMHUB_IO_SHIM_DIR:$PATH"
fi
