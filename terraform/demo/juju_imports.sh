#!/bin/bash
# Import the charm deployed via juju CLI into Terraform state.
# DEMO_ID and MODEL_UUID are provided by the action as environment variables.
if ! terraform -chdir=terraform/demo state show juju_application.demo >/dev/null 2>&1; then
  terraform -chdir=terraform/demo import juju_application.demo "${MODEL_UUID}:${DEMO_ID}"
fi
