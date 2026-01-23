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

The simplest way to run the site locally is using [`dotrun`](https://github.com/canonical/dotrun):

```bash
dotrun
```

Once the server has started, you can visit <http://127.0.0.1:8045> in your browser. You can stop the server using `<ctrl>+c`.

> If you're running dotrun on macOS or Windows, you will have to use a different command to launch dotrun with an additional argument in order to get JavaScript code working:
```bash
dotrun -p 5045:5045
```

For more detailed local development instructions, see [HACKING.md](HACKING.md).

## License

The content of this project is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International license](https://creativecommons.org/licenses/by-sa/4.0/), and the underlying code used to format and display that content is licensed under the [LGPLv3](http://opensource.org/licenses/lgpl-3.0) by [Canonical Ltd](http://www.canonical.com/).


With ♥ from Canonical
