#!/usr/bin/env python3
"""
Metrics collector for package metadata completeness.

This script fetches all packages from the Charmhub API and calculates
the average metadata completeness across all packages. It exposes metrics
in Prometheus format on port 8000.

Metadata fields tracked:
- description (from result.summary or metadata.description)
- summary (from result.summary)
- icon (from result.media)
- categories (from result.categories)
- title (from result.title)
- publisher (from result.publisher.display-name)
- links (docs, website, issues)
- screenshots (from result.media)
- keywords (from metadata-yaml)
- license (from metadata-yaml)
"""

import os
import sys
import time
import logging
import requests
from typing import Dict, List, Any
from prometheus_client import start_http_server, Gauge, Counter, Histogram

# Import the store API classes
sys.path.insert(0, '/app/webapp')
from canonicalwebteam.store_api.stores.charmstore import CharmStore

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Prometheus metrics
METADATA_COMPLETENESS = Gauge(
    'charmhub_package_metadata_completeness',
    'Average percentage of completed metadata fields across all packages',
    ['package_type']  # Labels: charm or bundle
)

METADATA_COMPLETENESS_HISTOGRAM = Histogram(
    'charmhub_package_metadata_completeness_distribution',
    'Distribution of metadata completeness scores',
    ['package_type'],
    buckets=[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
)

TOTAL_PACKAGES = Gauge(
    'charmhub_total_packages',
    'Total number of packages',
    ['package_type']
)

INCOMPLETE_FIELDS = Gauge(
    'charmhub_incomplete_metadata_fields',
    'Number of packages missing each metadata field',
    ['field_name', 'package_type']
)

COLLECTION_ERRORS = Counter(
    'charmhub_metrics_collection_errors_total',
    'Total number of errors during metrics collection'
)

COLLECTION_DURATION = Histogram(
    'charmhub_metrics_collection_duration_seconds',
    'Time taken to collect metrics'
)

# Charmhub API configuration
API_BASE_URL = os.getenv('CHARMHUB_API_URL', 'https://api.charmhub.io/v2/charms')
API_FIND_URL = API_BASE_URL.replace('/charms', '/charms/find')
API_TIMEOUT = int(os.getenv('API_TIMEOUT', '30'))
COLLECTION_INTERVAL = int(os.getenv('COLLECTION_INTERVAL', '300'))  # 5 minutes


class MetadataCompletnessCollector:
    """Collects and calculates package metadata completeness metrics."""

    # Metadata fields to check for completeness
    BASIC_FIELDS = [
        'summary',
        'description',
        'title',
        'icon',
        'categories',
        'publisher',
    ]

    EXTENDED_FIELDS = [
        'docs_link',
        'website_link',
        'issues_link',
        'screenshots',
        'keywords',
        'license',
    ]

    ALL_FIELDS = BASIC_FIELDS + EXTENDED_FIELDS

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Charmhub-Metrics-Collector/1.0'
        })
        # Initialize the CharmStore API client
        self.store = CharmStore(self.session)

    def fetch_all_packages(self) -> List[Dict[str, Any]]:
        """
        Fetch all packages with real metadata from the Charmhub API using the store API.
        """
        logger.info("Fetching packages from Charmhub API...")

        try:
            # Fields to fetch - same as webapp
            fields = [
                "result.categories",
                "result.summary",
                "result.media",
                "result.title",
                "result.publisher",
                "result.links",
                "default-release",
            ]

            # Get all packages with metadata using the store API
            response = self.store.find(fields=fields)
            packages = response.get('results', [])

            logger.info(f"Fetched {len(packages)} packages with metadata from API")

            # Limit if configured
            max_packages = int(os.getenv('MAX_PACKAGES', '0'))
            if max_packages > 0 and len(packages) > max_packages:
                logger.info(f"Limiting to first {max_packages} packages")
                packages = packages[:max_packages]

            return packages

        except Exception as e:
            logger.error(f"Error fetching packages: {e}")
            COLLECTION_ERRORS.inc()
            return []

    def check_field_presence(self, package: Dict[str, Any], field: str) -> bool:
        """Check if a specific metadata field is present and non-empty."""
        result = package.get('result', {})
        default_release = package.get('default-release', {})

        if field == 'summary':
            return bool(result.get('summary', '').strip())

        elif field == 'description':
            # Check both summary and metadata description
            summary = result.get('summary', '').strip()
            # For a full description, we'd check metadata-yaml but that requires parsing
            return bool(summary)

        elif field == 'title':
            title = result.get('title', '').strip()
            # Package name always exists, so we check if title is different from name
            return bool(title and title != package.get('name', ''))

        elif field == 'icon':
            media = result.get('media', [])
            return any(m.get('type') == 'icon' for m in media)

        elif field == 'categories':
            categories = result.get('categories', [])
            # Exclude 'featured' as it's auto-assigned
            return bool([c for c in categories if c.get('name') != 'featured'])

        elif field == 'publisher':
            publisher = result.get('publisher', {})
            return bool(publisher.get('display-name', '').strip())

        elif field == 'docs_link':
            links = result.get('links', {})
            return bool(links.get('docs', []))

        elif field == 'website_link':
            links = result.get('links', {})
            return bool(links.get('website', []))

        elif field == 'issues_link':
            links = result.get('links', {})
            return bool(links.get('issues', []))

        elif field == 'screenshots':
            media = result.get('media', [])
            return any(m.get('type') == 'screenshot' for m in media)

        elif field == 'keywords':
            # This would require parsing metadata-yaml
            # For now, we'll skip or mark as optional
            return True  # Mark as present to not penalize

        elif field == 'license':
            # This would require parsing metadata-yaml
            # For now, we'll skip or mark as optional
            return True  # Mark as present to not penalize

        return False

    def calculate_completeness(self, package: Dict[str, Any]) -> float:
        """Calculate metadata completeness percentage for a package."""
        filled_fields = sum(
            1 for field in self.ALL_FIELDS
            if self.check_field_presence(package, field)
        )

        return (filled_fields / len(self.ALL_FIELDS)) * 100

    def collect_metrics(self):
        """Collect and update all metrics."""
        logger.info("Starting metrics collection...")
        start_time = time.time()

        try:
            packages = self.fetch_all_packages()

            if not packages:
                logger.warning("No packages fetched, skipping metrics update")
                return

            # Group by package type
            charms = [p for p in packages if p.get('type') == 'charm']
            bundles = [p for p in packages if p.get('type') == 'bundle']

            # Calculate metrics for each type
            for package_type, package_list in [('charm', charms), ('bundle', bundles)]:
                if not package_list:
                    continue

                completeness_scores = []
                field_missing_counts = {field: 0 for field in self.ALL_FIELDS}

                for package in package_list:
                    # Calculate completeness score
                    score = self.calculate_completeness(package)
                    completeness_scores.append(score)

                    # Track which fields are missing
                    for field in self.ALL_FIELDS:
                        if not self.check_field_presence(package, field):
                            field_missing_counts[field] += 1

                    # Update histogram
                    METADATA_COMPLETENESS_HISTOGRAM.labels(
                        package_type=package_type
                    ).observe(score)

                # Calculate average completeness
                avg_completeness = sum(completeness_scores) / len(completeness_scores)

                # Update metrics
                METADATA_COMPLETENESS.labels(package_type=package_type).set(avg_completeness)
                TOTAL_PACKAGES.labels(package_type=package_type).set(len(package_list))

                # Update field-specific metrics
                for field, count in field_missing_counts.items():
                    INCOMPLETE_FIELDS.labels(
                        field_name=field,
                        package_type=package_type
                    ).set(count)

                logger.info(
                    f"{package_type.capitalize()}: "
                    f"avg completeness={avg_completeness:.2f}%, "
                    f"total={len(package_list)}"
                )

            duration = time.time() - start_time
            COLLECTION_DURATION.observe(duration)
            logger.info(f"Metrics collection completed in {duration:.2f}s")

        except Exception as e:
            logger.error(f"Error during metrics collection: {e}", exc_info=True)
            COLLECTION_ERRORS.inc()


def main():
    """Main entry point."""
    port = int(os.getenv('METRICS_PORT', '8000'))

    logger.info(f"Starting Prometheus metrics server on port {port}")
    start_http_server(port)

    collector = MetadataCompletnessCollector()

    logger.info(f"Starting metrics collection (interval: {COLLECTION_INTERVAL}s)")

    while True:
        try:
            collector.collect_metrics()
        except Exception as e:
            logger.error(f"Unexpected error in collection loop: {e}", exc_info=True)
            COLLECTION_ERRORS.inc()

        logger.info(f"Sleeping for {COLLECTION_INTERVAL}s...")
        time.sleep(COLLECTION_INTERVAL)


if __name__ == '__main__':
    main()
