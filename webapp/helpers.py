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
        if len(filters[filter_type]) > 0:
            filter_type_filters = ",".join(filters[filter_type])
            filter_string.append(f"{filter_type}={filter_type_filters}")

    if len(filter_string) == 0:
        filter_string = "/"
    elif len(filter_string) == 1:
        filter_string = f"?{filter_string[0]}"
    else:
        filter_string = f"?{'&'.join(filter_string)}"

    return filter_string


def add_filter(filter_type, filter_name):
    filters = split_filters(request.args)
    new_filters = filters.copy()
    if filter_type not in new_filters:
        new_filters[filter_type] = [filter_name]
    elif filter_name not in new_filters[filter_type]:
        new_filters[filter_type].append(filter_name)

    return join_filters(new_filters)


def remove_filter(filter_type, filter_name):
    filters = split_filters(request.args)
    new_filters = filters.copy()
    if filter_type in new_filters and filter_name in filters[filter_type]:
        new_filters[filter_type].remove(filter_name)

    return join_filters(new_filters)


def active_filter(filter_type, filter_name):
    filters = split_filters(request.args)
    if filter_type in filters and filter_name in filters[filter_type]:
        return True

    return False


def get_filter_count():
    filters = split_filters(request.args)
    count = 0
    for filter_type in filters:
        count += len(filters[filter_type])

    return count
