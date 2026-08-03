# Terraform environments

This project provides Terraform configurations that allow users to spin up
an environment as close to production as possible in the user's computer.

This can be useful for testing or learning about our own infrastructure.

Follow the README instructions in nested folders to deploy the environments.

## Requirements

To spin up all the necessary infrastructure locally you'll need:
1. [Multipass](https://canonical.com/multipass)
2. [webteam-juju-dev-provisioning](https://github.com/canonical/webteam-juju-dev-provisioning)

If you want to be able to access the application running inside the VM then
you'll need a couple more things:
1. [python3](https://www.python.org/downloads/) for running some scripts
provided by `webteam-juju-dev-provisioning`
2. [certutil](https://man.archlinux.org/man/certutil.1.en): install via
`apt-get install libnss3-tools` (linux) or `brew install nss` (macos)

That's it! With a couple commands you'll be able to spin up prod-like
environments in no time.
