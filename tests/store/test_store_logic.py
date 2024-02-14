from unittest import TestCase
from webapp.store.logic import (
    convert_channel_maps,
    extract_series,
    extract_bases,
    format_slug,
    get_banner_url,
    get_library,
    process_libraries,
    add_store_front_data,
)
from mock_data.mock_store_logic import (
    sample_channel_map,
    converted_sample_channel_map,
    sample_libraries,
    sample_processed_libraries,
    sample_charm,
)


class TestConvertChannelMaps(TestCase):
    def test_convert_channel_map(self):
        result = convert_channel_maps(sample_channel_map)
        self.assertDictEqual(result, converted_sample_channel_map)


class TestAddStoreFront(TestCase):
    def test_add_store_front_data(self):
        result = add_store_front_data(sample_charm)

        self.assertIn("store_front", result)

        self.assertIn("icons", result["store_front"])
        self.assertIn("deployable-on", result["store_front"])
        self.assertIn("categories", result["store_front"])
        self.assertIn("display-name", result["store_front"])


class TestGetBannerUrl(TestCase):
    def test_banner_url_in_media(self):
        media = [
            {"type": "image", "url": "https://example.com/image1.jpg"},
            {"type": "banner", "url": "https://example.com/banner.jpg"},
            {"type": "video", "url": "https://example.com/video.mp4"},
        ]

        result = get_banner_url(media)

        self.assertEqual(result, "https://example.com/banner.jpg")

    def test_banner_url_not_in_media(self):
        media = [
            {"type": "image", "url": "https://example.com/image1.jpg"},
            {"type": "video", "url": "https://example.com/video.mp4"},
        ]

        result = get_banner_url(media)

        self.assertIsNone(result)

    def test_empty_media_list(self):
        media = []

        result = get_banner_url(media)

        self.assertIsNone(result)


class TestExtractSeries(TestCase):
    def test_extract_series_short_name(self):
        result = extract_series(sample_channel_map[0], long_name=False)
        expected_result = ["14.04", "12.04"]
        self.assertListEqual(result, expected_result)

    def test_extract_series_long_name(self):
        result = extract_series(sample_channel_map[1], long_name=True)
        expected_result = ["Ubuntu 20.04", "Ubuntu 18.04"]
        self.assertListEqual(result, expected_result)

    def test_extract_series_duplicate_bases(self):
        result = extract_series(sample_channel_map[1], long_name=False)
        expected_result = ["20.04", "18.04"]
        self.assertListEqual(result, expected_result)


class TestExtractBases(TestCase):
    def test_extract_bases(self):
        result = extract_bases(sample_channel_map[0])
        expected_result = [{"channels": ["14.04", "12.04"], "name": "ubuntu"}]
        self.assertEqual(result, expected_result)

    def test_extract_bases_empty_bases(self):
        channel = {"revision": {"bases": []}}
        result = extract_bases(channel)
        self.assertEqual(result, [])

    def test_extract_bases_duplicate_bases(self):
        result = extract_bases(sample_channel_map[1])
        expected_result = [{"channels": ["20.04", "18.04"], "name": "ubuntu"}]
        self.assertEqual(result, expected_result)


class TestLibraries(TestCase):
    def test_process_libraries(self):
        self.assertListEqual(
            process_libraries(sample_libraries), sample_processed_libraries
        )

    def test_get_library(self):
        libraries = [
            {"name": "library1", "id": "lb1"},
            {"name": "library2", "id": "lb2"},
            {"name": "library3", "id": "lb3"},
            {"name": "library4", "id": "lb4"},
            {"name": "library5", "id": "lb5"},
        ]

        self.assertEqual(get_library("library1", libraries), "lb1")
        self.assertIsNone(get_library("library6", libraries))


class TestFormatslug(TestCase):
    def test_format_slug(self):
        sample_slug1 = "sample-slug1"
        sample_slug2 = "sample_slug2"
        sample_slug3 = "sample And slug3"
        sample_slug4 = "sample Iot slug4"

        self.assertEqual(format_slug(sample_slug1), "Sample Slug1")
        self.assertEqual(format_slug(sample_slug2), "Sample Slug2")
        self.assertEqual(format_slug(sample_slug3), "Sample and Slug3")
        self.assertEqual(format_slug(sample_slug4), "Sample IoT Slug4")
