from flask import request


def split_filters(filters):
    filter_params = {}

    for charm_filter in filters:
        if charm_filter not in filter_params:
            filter_params[charm_filter] = []

        filter_params[charm_filter] += filters[charm_filter].split(",")

    return filter_params


def join_filters(filters):
    filter_string = []

    for filter_type in filters:
        filter_type_filters = ",".join(filters[filter_type])
        filter_string.append(f"{filter_type}={filter_type_filters}")

    filter_string = "&".join(filter_string)

    return f"?{filter_string}"


def add_filter(filter_type, filter_name):
    filters = split_filters(request.args)
    new_filters = filters.copy()
    if filter_type not in new_filters:
        new_filters[filter_type] = [filter_name]
    elif filter_name not in new_filters[filter_type]:
        new_filters[filter_type].append(filter_name)

    return join_filters(new_filters)


def active_filter(filter_type, filter_name):
    filters = split_filters(request.args)
    if filter_type in filters and filter_name in filters[filter_type]:
        return True

    return False
