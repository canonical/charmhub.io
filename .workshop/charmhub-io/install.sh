#!/bin/bash
# Installs the project's Python and Node dependencies. Shared by the
# charmhub SDK's setup-project hook and the `install` action so both paths
# stay identical. Replaces `dotrun install`.

set -euo pipefail

source /project/.workshop/charmhub-io/env.sh

if [ ! -x /project/.venv/bin/python ]; then
  uv venv --python "$(cat /project/.python-version)" /project/.venv
fi

uv pip install --python /project/.venv/bin/python \
  --requirement /project/requirements.txt

yarn install
