resource "juju_integration" "ingress_app" {
  model_uuid  = module.app_ps7.model_uuid

  application {
    name      = juju_application.charmhub_io.name
    endpoint  = var.ingress_endpoint
  }

  application {
    name      = module.app_ps7.ingress_app_name
    endpoint  = var.ingress_endpoint
  }
}

resource "juju_integration" "app_smtp" {
  model_uuid  = module.app_ps7.model_uuid

  application {
    name      = juju_application.charmhub_io.name
    endpoint  = var.smtp_endpoint
  }

  application {
    name      = juju_application.smtp.name
    endpoint  = var.smtp_endpoint
  }
}
