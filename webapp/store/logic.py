import datetime

import humanize
from dateutil import parser


def get_banner_url(media):
    """
    Get banner url from media object

    :param media: the media dictionnary
    :returns: the banner url
    """
    for m in media:
        if m["type"] == "banner":
            return m["url"]

    return None


def convert_channel_maps(channel_map):
    """
    Converts channel maps list to format easier to manipulate

    :param channel_maps_list: The channel maps list returned by the API

    :returns: The channel maps reshaped
    """
    channel_map_restruct = {}

    for channel in channel_map:
        track = channel.get("channel").get("track")
        risk = channel.get("channel").get("risk")

        if track not in channel_map_restruct:
            channel_map_restruct[track] = {}

        if risk not in channel_map_restruct[track]:
            channel_map_restruct[track][risk] = []

        info = {
            "created_at": convert_date(channel["revision"]["created-at"]),
            "version": channel["revision"]["version"],
            "channel": channel["channel"]["name"],
            "risk": channel["channel"]["risk"],
            "size": channel["revision"]["download"]["size"],
        }

        channel_map_restruct[track][risk].append(info)

    return channel_map_restruct


def convert_date(date_to_convert):
    """
    Convert date to human readable format: Month Day Year

    If date is less than a day return: today or yesterday

    Format of date to convert: 2019-01-12T16:48:41.821037+00:00
    Output: Jan 12 2019

    :param date_to_convert: Date to convert
    :returns: Readable date
    """
    date_parsed = parser.parse(date_to_convert).replace(tzinfo=None)
    delta = datetime.datetime.now() - datetime.timedelta(days=1)
    if delta < date_parsed:
        return humanize.naturalday(date_parsed).title()
    else:
        return date_parsed.strftime("%-d %B %Y")


def get_icons(package):
    media = package[package["type"]]["media"]
    return [m["url"] for m in media if m["type"] == "icon"]


def add_store_front_data(package):
    package_data = package[package["type"]]
    extra = {}
    extra["icons"] = get_icons(package)
    extra["publisher_name"] = package_data["publisher"]["display-name"]
    extra["summary"] = package_data["summary"]
    extra["channel_map"] = convert_channel_maps(package["channel-map"])
    package["store_front"] = extra

    return package
