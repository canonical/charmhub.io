
resource "juju_application" "demo" {
  name       = var.demo_id
  model_uuid = data.juju_model.demos.uuid

  charm {
    name = "charmhub-io"
  }

  config = {
    hmac-secret = "secret:${data.juju_secret.hmac-secret.secret_id}"
  }
}

data "juju_secret" "hmac-secret" {
  name       = "hmac-secret"
  model_uuid = data.juju_model.demos.uuid
}

resource "juju_access_secret" "charmhub-secret-access" {
  model_uuid = data.juju_model.demos.uuid

  secret_id = data.juju_secret.hmac-secret.secret_id

  applications = [
    juju_application.demo.name
  ]
}

resource "juju_integration" "demo_ingress" {
  model_uuid = data.juju_model.demos.uuid

  application {
    name     = juju_application.demo.name
    endpoint = "ingress"
  }

  application {
    name     = "subdomain-integrator"
    endpoint = "ingress"
  }
}

