from canonicalwebteam.flask_base.app import FlaskBase
from flask import render_template

from webapp import helpers
from webapp.charmhub import config

app = FlaskBase(
    __name__,
    config.app_name,
    template_folder="../templates",
    static_folder="../static",
    template_404="404.html",
    template_500="500.html",
)


@app.context_processor
def utility_processor():
    return {
        "add_filter": helpers.add_filter,
        "active_filter": helpers.active_filter,
        "remove_filter": helpers.remove_filter,
    }


@app.route("/")
def index():
    search_results = [
        {
            "developer_validation": "unproven",
            "icon_url": "https://dashboard.snapcraft.io/site_media/appmedia/"
            "2016/09/logo_-_256px.png",
            "media": [
                {
                    "type": "icon",
                    "url": "https://dashboard.snapcraft.io/site_media/"
                    "appmedia/2016/09/logo_-_256px.png",
                },
                {
                    "type": "screenshot",
                    "url": "https://dashboard.snapcraft.io/site_media/"
                    "appmedia/2016/09/"
                    "Electrum_2.6.4__-__default_wallet_018.png",
                },
            ],
            "origin": "antonwilc0x",
            "package_name": "electrum",
            "type": "bundle",
            "publisher": "Tomas CaseyWilcox",
            "sections": [{"featured": True, "name": "finance"}],
            "summary": "Lightweight Bitcoin Client",
            "title": "electrum",
        },
        {
            "developer_validation": "verified",
            "icon_url": "https://dashboard.snapcraft.io/site_media/"
            "appmedia/2017/06/copy_1.ico.png",
            "media": [
                {
                    "type": "icon",
                    "url": "https://dashboard.snapcraft.io/site_media/"
                    "appmedia/2017/06/copy_1.ico.png",
                },
                {
                    "type": "screenshot",
                    "url": "https://dashboard.snapcraft.io/site_media/"
                    "appmedia/2017/06/"
                    "Screen_Shot_2017-06-07_at_8.16.09_AM.png",
                },
            ],
            "origin": "aws",
            "package_name": "aws-cli",
            "type": "charm",
            "publisher": "Amazon Web Services",
            "sections": [{"featured": True, "name": "server-and-cloud"}],
            "summary": "Universal Command Line Interface for"
            " Amazon Web Services",
            "title": "aws-cli",
        },
        {
            "developer_validation": "unproven",
            "icon_url": "https://dashboard.snapcraft.io/site_media/appmedia"
            "/2018/03/rsz_android_studio_icon.png",
            "media": [
                {
                    "type": "icon",
                    "url": "https://dashboard.snapcraft.io/site_media"
                    "/appmedia/2018/03/rsz_android_studio_icon.png",
                },
                {
                    "type": "screenshot",
                    "url": "https://dashboard.snapcraft.io/site_media"
                    "/appmedia/2018/03/android-studio.png",
                },
                {
                    "type": "screenshot",
                    "url": "https://dashboard.snapcraft.io/site_media"
                    "/appmedia/2019/04/Screenshot_20190418_002828.png",
                },
            ],
            "origin": "snapcrafters",
            "package_name": "android-studio",
            "publisher": "Snapcrafters",
            "sections": [{"featured": True, "name": "development"}],
            "summary": "The IDE for Android",
            "title": "Android Studio",
        },
    ]

    context = {"results": search_results}
    return render_template("index.html", **context)


@app.route('/<regex("' + config.details_regex + '"):entity_name>')
def details(entity_name):
    # TO DO - get entity info from API

    context = {
        "entity-id": "RT9mcUhVsRYrDLG8qnvGiy26NKvv6Qkd",
        "entity_title": "VLC",
        "package_name": "vlc",
        "categories": [{"slug": "photo-and-video", "name": "Photo and Video"}],
        "icon_url": "https://dashboard.snapcraft.io/site_media/appmedia/2016/"
        "07/vlc.png",
        "version": "3.0.8",
        "license": "GPL-2.0+",
        "publisher": "VideoLAN",
        "username": "videolan",
        "screenshots": [
            {
                "height": "None",
                "type": "screenshot",
                "url": "https://dashboard.snapcraft.io/site_media/appmedia/"
                "2016/07/vlc-2.0-poney.jpg",
                "width": "None",
            },
            {
                "height": "None",
                "type": "screenshot",
                "url": "https://dashboard.snapcraft.io/site_media/appmedia/"
                "2018/04/2018-04-26-161203_1126x899_scrot_yBFL55L.png",
                "width": "None",
            },
        ],
        "videos": [],
        "prices": {},
        "contact": "https://www.videolan.org/support/",
        "website": "https://www.videolan.org/vlc/",
        "summary": "The ultimate media player",
        "description": "<p>VLC is the VideoLAN project's media player.</p>"
        "\n<p>Completely open source and privacy-friendly, it plays every "
        "multimedia file and streams.</p>\n<p>It notably plays MKV, MP4, "
        "MPEG, MPEG-2, MPEG-4, DivX, MOV, WMV, QuickTime, WebM, FLAC, MP3, "
        "Ogg/Vorbis files, BluRays, DVDs, VCDs, podcasts, and multimedia "
        "streams from various network sources. It supports subtitles, closed "
        "captions and is translated in numerous languages.</p>\n",
        "channel_map": {
            "amd64": {
                "latest": [
                    {
                        "created-at": "16 December 2019",
                        "version": "3.0.8",
                        "channel": "stable",
                        "risk": "stable",
                        "confinement": "strict",
                        "size": 212758528,
                    },
                    {
                        "created-at": "16 December 2019",
                        "version": "3.0.8",
                        "channel": "candidate",
                        "risk": "candidate",
                        "confinement": "strict",
                        "size": 212758528,
                    },
                    {
                        "created-at": "30 March 2020",
                        "version": "3.0.8-308-g9488c3e",
                        "channel": "beta",
                        "risk": "beta",
                        "confinement": "strict",
                        "size": 206848000,
                    },
                    {
                        "created-at": "30 March 2020",
                        "version": "4.0.0-dev-11534-gd2a01fe376",
                        "channel": "edge",
                        "risk": "edge",
                        "confinement": "strict",
                        "size": 340590592,
                    },
                ]
            }
        },
        "entity_type": "charm",
        "deployments": "6021",
        "has_stable": True,
        "developer_validation": "verified",
        "default_track": "latest",
        "lowest_risk_available": "stable",
        "confinement": "strict",
        "trending": False,
        "filesize": "212.8 MB",
        "last_updated": "16 December 2019",
        "last_updated_raw": "2019-12-16T21:50:10.209544+00:00",
        "is_users_snap": False,
        "unlisted": False,
    }

    return render_template("details.html", **context)
