# charmhub.io

Terraform configuration to deploy a PS7-like environment with charmhub-io application 
locally in a Multipass VM.

To be able to use this you should have installed the 
[webteam-juju-dev-provisioning](https://github.com/alvaromateo/webteam-juju-dev-provisioning/tree/ingress)
(switch to the 'ingress' branch to make sure you have the latest changes before installing) and
launched a Multipass VM from the root of this project (where the `juju_local.yaml` file is).

## How to deploy

SSH into the Multipass VM and go into this project's `terraform/local-ps7` directory.

```bash
terraform init
terraform apply -auto-approve
```

The full PS7 local environment will be deployed in Multipass' VM.

## Access the app from your host browser

The app is served by HAProxy, which runs in an LXD container inside the VM on a
network your host cannot reach directly, and it routes by `Host` header (e.g.
`app.local`). Terraform discovers the VM IP and the HAProxy IP and exposes them
as outputs; two small wrappers apply them.

Check the discovered values (optional):

```bash
terraform output          # vm_ip, haproxy_ip, hostnames, ...
```

### 1. In the VM — forward the VM's ports to HAProxy

```bash
sudo configure-ingress-forwarding
```

This reads the Terraform outputs and installs a static nftables DNAT rule
(`VM_IP:80,443 -> HAPROXY_IP`).

### 2. On your host laptop — resolve the hostname

```bash
sudo .ingress_hosts_sync.sh <vm-name>   # e.g. test-ingress
container_ca_trust <vm-name>            # set up certs to make SSO work
```

This writes a managed block into your `/etc/hosts` mapping the ingress
hostnames to the VM. Works on Linux and macOS; only needs `multipass`. Remove
it with `--delete`.

Then open `https://app.local` in your browser.

> Note: the nftables rule uses the HAProxy IP as discovered at `apply` time. If
> HAProxy is redeployed and its IP changes, re-run `terraform apply` followed by
> step 1 (and step 2 if the VM IP changed).

### Configuration

There are some secrets that are not safe to store in configuration files,
so you'll have to add them manually via `juju`. In order to retrieve them you'll
have to log in in one of our real environments (STG/PROD) or Vault and get them from there.

Connect to the VPN and SSH into PS6's bastion (using your private key and user):

```bash
ssh -i ~/.ssh/<private_key> <user>@webdesign-bastion-ps6.internal
```

Once there type `pe`, search for STG (stg-charmhub-io-k8s) or PROD (prod-charmhub-io)
charmhub environment and type its number. Then type these commands:

```bash
juju config smtp-integrator password
juju config charmhub-io github-token
```

Take note of each of those values, then jump back into the Multipass shell
and add those configuration options:

```bash
juju config smtp-integrator password=<value1>
juju config charmhub-io github-token=<value2>
```

### Clean up

You can remove the certificates added to your browser by running:

```bash
container_ca_trust <vm-name> --delete
```

## How to test charm changes

- Bind mount project folder to the VM: `multipass mount <folder> <vm_name>:<vm_folder>`
- Do changes to your project as usual in your host
- Shell into Multipass: `multipass shell <vm_name>`
- Build rock & charm:
- Deploy

### Build rock & charm

Your project should have a `rockcraft.yaml` file.
Inside the VM and in the same directory as that file:

```bash
export ROCKCRAFT_ENABLE_EXPERIMENTAL_EXTENSIONS=True

# Create rock
rockcraft pack
# Take note of the .rock file that is output by `rockcraft pack`
# Choose a name for your rock and a version and take note of those too
rockcraft.skopeo copy \
  --insecure-policy \
  --dest-tls-verify=false \
  oci-archive:${rockcraft_pack_output} \
  docker://localhost:32000/${rock_name}:${version}
```

For building the charm you should have a `charm/` directory with a `charmcraft.yaml`
file and a `src/` folder for the charm code.

```bash
export CHARMCRAFT_ENABLE_EXPERIMENTAL_EXTENSIONS=True

# Create charm
cd charm
charmcraft fetch-libs
charmcraft pack
# Take note of the .charm file that is output by `charmcraft pack`
```

### Deploy

You should have already gone through the deployment process with Terraform.
If you have done so, deploying the app with the new changes is very simple.
From inside the VM:

```bash
# Find the model where Terraform has deployed the app (default 'app')
juju models
# Switch to the model and find the charm name
juju switch app
juju status
# Under the 'App' column you should see the name of your app:
# in this case it should be charmhub-io by default

# To deploy the new version of the app run the following command
# (rock_name and version are the ones you gave to the image in the line
# `docker://localhost:32000/${rock_name}:${version}`)
juju refresh charmhub-io \
  --path ${charmcarft_pack_output} \
  --resource flask-app-image=localhost:32000/${rock_name}:${version}
```
