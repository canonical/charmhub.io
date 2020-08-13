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
    media = package["charm"]["media"]
    return [m["url"] for m in media if m["type"] == "icon"]


def format_category_name(slug):
    """Format category name into a standard title format
    :param slug: The hypen spaced, lowercase slug to be formatted
    :return: The formatted string
    """
    return (
        slug.title()
        .replace("-", " ")
        .replace("And", "and")
        .replace("Iot", "IoT")
    )


def get_categories(categories_json):
    """Retrieve and flatten the nested array from the legacy API response.
    :param categories_json: The returned json
    :returns: A list of categories
    """

    categories = []
    category_names = [cat["name"] for cat in categories_json]

    for category in category_names:
        categories.append(
            {"slug": category, "name": format_category_name(category)}
        )

    return categories


def add_store_front_data(package):
    extra = {}
    extra["icons"] = get_icons(package)
    extra["categories"] = get_categories(package["charm"]["categories"])
    extra["publisher_name"] = package["charm"]["publisher"]["display-name"]
    extra["last_release"] = convert_date(
        package["default-release"]["channel"]["released-at"]
    )
    extra["summary"] = package["charm"]["summary"]
    if package.get("channel-map"):
        extra["channel_map"] = convert_channel_maps(package["channel-map"])
    package["store_front"] = extra

    return package
