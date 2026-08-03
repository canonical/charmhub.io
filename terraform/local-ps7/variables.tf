variable "units" {
  description = "Number of units per application."
  type        = map(number)
  default     = {
    charmhub  = 2
    smtp      = 1
  }
}

variable "smtp_endpoint" {
  description = "SMTP relation endpoint"
  type        = string
  default     = "smtp"
}

variable "ingress_endpoint" {
  description = "ingress relation endpoint"
  type        = string
  default     = "ingress"
}