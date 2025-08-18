import requests
from canonicalwebteam.store_api.devicegw import DeviceGW
from canonicalwebteam.store_api.publishergw import PublisherGW
from webapp.observability.utils import trace_function


def decorate_all_methods(decorator, cls):
    class WrappedClass(cls):
        pass

    for attr_name in dir(cls):
        # ignore private and special methods like __init__ etc.
        if attr_name.startswith("__"):
            continue
        attr = getattr(cls, attr_name)
        # only decorate callable attributes (these are mostly API calls)
        if callable(attr):
            setattr(WrappedClass, attr_name, decorator(attr))

    return WrappedClass


TracedPubilsherGW = decorate_all_methods(trace_function, PublisherGW)
TracedDeviceGW = decorate_all_methods(trace_function, DeviceGW)


request_session = requests.Session()
publisher_gateway = TracedPubilsherGW("charm", request_session)
device_gateway = TracedDeviceGW("charm", request_session)
