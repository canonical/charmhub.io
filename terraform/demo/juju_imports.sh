#!/bin/bash
# Import the charm deployed via juju CLI into Terraform state.
# DEMO_ID and MODEL_UUID are provided by the action as environment variables.
terraform -chdir=terraform/demo import juju_application.demo "${MODEL_UUID}:${DEMO_ID}"

