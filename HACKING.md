
# Working on charmhub.io

## Use staging APIs

To use staging APIs locally you can add the following lines to an `.env.local` file:

```bash
CHARMSTORE_API_URL=https://api.staging.snapcraft.io/
CHARMSTORE_PUBLISHER_API_URL=https://api.staging.charmhub.io/
CANDID_API_URL=https://api.staging.jujucharms.com/identity/
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

Install the [`dotrun`](https://snapcraft.io/dotrun) snap.

``` bash
dotrun test
```

## Status checks and prometheus metrics

[Talisker](https://talisker.readthedocs.io/en/latest/) provides a bunch of useful status checks and metrics about the running application. Some of this information is sensitive and so to access it you need to run the site with your IP address mentioned in the `TALISKER_NETWORKS` variable.

Now visit http://127.0.0.1:8045/_status to see the endpoints provided by Talisker. Useful ones include:

- http://127.0.0.1:8045/_status/check - A basic check that the site is running
- http://127.0.0.1:8045/_status/metrics - The prometheus metrics for the application
