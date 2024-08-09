# The Charm for the charmhub.io website

This charm was created using the [PaaS App Charmer](https://juju.is/docs/sdk/paas-charm)

## Local development

To work on this charm locally, you first need to set up an environment, follow [this section](https://juju.is/docs/sdk/write-your-first-kubernetes-charm-for-a-flask-app#heading--set-things-up) of the tutorial.

Then, you can run the following command to pack and upload the rock:

```bash
rockcraft pack
rockcraft.skopeo --insecure-policy copy --dest-tls-verify=false oci-archive:charmhub-io*.rock docker://localhost:32000/charmhub-io:1
```

You can deploy the charm locally with:

```bash
cd charm
charmcraft fetch-libs
charmcraft pack
juju deploy ./*.charm --resource flask-app-image=localhost:32000/charmhub-io:1
```

once `juju status` reports the charm as `active`, you can test the webserver:

```bash
curl {IP_OF_CHARMHUB_IO_UNIT}:8000
```

to connect using a browser, the easiest way is to integrate with `nginx-ingress-integrator`:

```bash
juju deploy nginx-ingress-integrator --trust
juju config nginx-ingress-integrator service-hostname=charmhub.local path-routes=/
juju integrate nginx-ingress-integrator charmhub-io
```

You can then add `charmhub.local` to your `/etc/hosts` file with the IP of the multipass vm:

```bash
multipass ls # Get the IP of the VM
echo "{IP_OF_VM} charmhub.local" | sudo tee -a /etc/hosts
```


## Design Decisions:
- To keep the codebase clean and charm libraries updated, they are only fetched before packing the charm in the [Github Actions workflow](https://github.com/canonical/charmhub.io/blob/main/.github/workflows/publish_charm.yaml#L25).
- As all our work is open source, the charm is publicly available on [Charmhub](https://charmhub.io/charmhub-io), the rock image is also included as a resource. This significantly simplifies deployment.
