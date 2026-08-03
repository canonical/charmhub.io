output "vm_ip" {
  description = "External (Multipass) IP address of the VM, reachable from the host."
  value       = module.host_access.vm_ip
}

output "haproxy_ip" {
  description = "Public address of the HAProxy unit inside the VM."
  value       = module.host_access.haproxy_ip
}

output "ports" {
  description = "TCP ports forwarded from the VM to HAProxy."
  value       = module.host_access.ports
}

output "hostnames" {
  description = "Hostnames served by the ingress."
  value       = module.host_access.hostnames
}

output "ca_certificate" {
  description = "PEM-encoded CA certificate from the self-signed-certificates charm."
  value       = module.host_access.ca_certificate
}
