resource "juju_application" "demo" {
  name       = var.demo_id
  model_uuid = data.juju_model.demos.uuid

  charm {
    name = "charmhub-io"
  }
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

