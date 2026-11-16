# ![charmhub.io](https://user-images.githubusercontent.com/6353928/94026467-9dff1480-fdb1-11ea-8026-e866246815fc.png "Charmhub") charmhub.io codebase

[Python Coverage](https://canonical.github.io/charmhub.io/coverage/python) | [JavaScript Coverage](https://canonical.github.io/charmhub.io/coverage/js)

![Github Actions Status](https://github.com/canonical-web-and-design/charmhub.io/workflows/PR%20checks/badge.svg?branch=main) [![Code coverage](https://codecov.io/gh/canonical-web-and-design/charmhub.io/branch/main/graph/badge.svg)](https://codecov.io/gh/canonical-web-and-design/charmhub.io)

A charm is a software package that bundles an operator together with metadata that supports the integration of many operators in a coherent aggregated system.

An operator packaged as a charm means that it is configured, operated and integrated in a standard way regardless of the vendor or the application. Charms enable multi-vendor operator collections with standardised behaviours, reducing the learning curve associated with each operator and creating richer application ecosystems.

This repo is the application for the [charmhub.io](https://charmhub.io) website.

The site is largely maintained by the [Web and Design team](https://ubuntu.com/blog/topics/design) at [Canonical](https://www.canonical.com). It is a stateless website project based on [Flask](https://flask.palletsprojects.com/en/1.1.x/) and hosted on a [Charmed Kubernetes](https://ubuntu.com/kubernetes) cluster.


## Bugs and issues

If you have found a bug on the site or have an idea for a new feature, feel free to [create a new issue](https://github.com/canonical-web-and-design/charmhub.io/issues/new), or suggest a fix by [creating a pull request](https://help.github.com/articles/creating-a-pull-request/). You can also find a link to create issues in the footer of every page of the site itself.


## Local development

Use [Workshop](https://ubuntu.com/workshop/docs/) to run the site locally. It provides Python and Node.js, installs project dependencies, and forwards the Flask and Vite ports.

```bash
workshop launch # first-time setup
workshop run -- start
```

Visit <http://127.0.0.1:8045> once the server has started. Vite runs on port 5045 with live reloading. Stop the server with `Ctrl+C`.

For an existing workshop, use `workshop start` if it is stopped, or `workshop refresh` to update dependencies after pulling changes. Put local credentials and configuration overrides in `.env.local`; Workshop loads it after `.env`.

```bash
workshop run -- build             # build frontend assets
workshop run -- test              # build, lint, and run Python/JS tests
workshop run -- yarn test-js      # run an individual Yarn script
workshop run -- prod              # build and serve without the Vite dev server
```

The `prod` action uses `ENVIRONMENT=production` and `FLASK_DEBUG=0`, serving built assets with Flask debug mode and the reloader disabled.

> Workshop depends on LXD, which is only available on Linux. On macOS or Windows, run Workshop inside a [Multipass](https://canonical.com/multipass) VM. Configure Multipass to use the VirtualBox virtualization driver and allocate at least 4GB RAM and 10GB disk; after setting up the workshop in the VM, enable [port forwarding](https://canonical.com/multipass/docs/stable/how-to-guides/customise-multipass/set-up-the-driver/#use-virtualbox-to-set-up-port-forwarding-for-a-multipass-instance) for ports 8045 and 5045.

Production packaging and deployment continue to use `rockcraft.yaml` and the Juju charm, not the development environment.

For detailed development, testing, and native setup instructions, see [HACKING.md](HACKING.md).

## License

The content of this project is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International license](https://creativecommons.org/licenses/by-sa/4.0/), and the underlying code used to format and display that content is licensed under the [LGPLv3](http://opensource.org/licenses/lgpl-3.0) by [Canonical Ltd](http://www.canonical.com/).


With ♥ from Canonical
