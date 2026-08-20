terraform {
  required_providers {
    juju = {
      source  = "juju/juju"
      version = "~> 1.1.0"
    }
  }
}

provider "juju" {}

module "app_ps7" {
  source = "github.com/canonical/webteam-devops//terraform/local/modules/app-ps7?ref=terraform"
}

# Discovers the VM external IP and the HAProxy unit IP, and exposes them (plus
# the ingress hostnames) as outputs. Depends on app_ps7 so discovery runs
# only after the ingress/HAProxy stack exists.
# There should be a script in webteam-juju-dev-provisioning called
# configure_ingress_forwarding.sh that consumes these to configure host access.
module "host_access" {
  source = "github.com/canonical/webteam-devops//terraform/local/modules/host-access?ref=terraform"

  machine_model_name = module.app_ps7.machine_model_name
  app_name           = module.app_ps7.haproxy_app_name
  hostnames          = [module.app_ps7.ingress_hostname]

  certificates_model_name = module.app_ps7.k8s_model_name
  certificates_app_name   = module.app_ps7.certificates_app_name

  depends_on = [module.app_ps7]
}

resource "juju_application" "charmhub_io" {
  model_uuid = module.app_ps7.model_uuid
  units      = var.units["charmhub"]

  charm {
    name    = "charmhub-io"
    channel = "latest/stable"
  }
}

resource "juju_application" "smtp" {
  model_uuid = module.app_ps7.model_uuid
  units      = var.units["smtp"]

  charm {
    name = "smtp-integrator"
  }

  config = {
    domain = "canonical.com"
    host   = "smtp-restricted.canonical.com"
    port   = 587
    user   = "charmhub"
  }
}

# secrets (development only)
resource "juju_secret" "hmac_secret" {
  model_uuid = module.app_ps7.model_uuid
  name       = "hmac-secret"
  value = {
    key = "secret-key"
  }
}

# secret access resource (equivelant to juju grant)
resource "juju_access_secret" "hmac_secret_access" {
  model_uuid = module.app_ps7.model_uuid
  secret_id  = resource.juju_secret.hmac_secret.secret_id

  applications = [
    juju_application.charmhub_io.name
  ]
}
