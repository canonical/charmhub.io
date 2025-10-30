# Package Metadata Completeness Metrics

This directory contains the configuration for collecting and visualizing package metadata completeness metrics in Charmhub.

## Overview

The **Average Package Metadata Completeness** metric tracks how well packages (charms and bundles) are documented by measuring the percentage of filled metadata fields across all packages.

### Why This Matters

Complete metadata makes packages:
- **Easier to find** - Better search results
- **Easier to understand** - Clear descriptions and documentation
- **More trustworthy** - Professional presentation with icons, screenshots, and links

If completeness increases, it means our publishing workflows and guidance successfully encourage better package presentation. If it decreases, we may need clearer UI hints or automated reminders to improve data quality.

## Metadata Fields Tracked

The completeness calculation includes these fields:

### Basic Fields (6)
1. **Summary** - Short description from `result.summary`
2. **Description** - Longer description (checked via summary for now)
3. **Title** - Display name from `result.title` (must differ from package name)
4. **Icon** - Package icon from `result.media` (type="icon")
5. **Categories** - Categories from `result.categories` (excluding auto-assigned "featured")
6. **Publisher** - Publisher display name from `result.publisher.display-name`

### Extended Fields (6)
7. **Documentation Link** - Docs URL from `result.links.docs`
8. **Website Link** - Website URL from `result.links.website`
9. **Issues Link** - Bug tracker URL from `result.links.issues`
10. **Screenshots** - Screenshots from `result.media` (type="screenshot")
11. **Keywords** - Keywords from metadata-yaml (marked as present for now)
12. **License** - License info from metadata-yaml (marked as present for now)

**Total: 12 fields** tracked per package

## Architecture

```
┌─────────────────────┐
│   Charmhub API      │
│  (api.charmhub.io)  │
└──────────┬──────────┘
           │
           │ Fetch packages
           │ every 5 minutes
           ↓
┌─────────────────────┐
│ Metrics Collector   │
│  (Python script)    │
│  Port: 8000         │
└──────────┬──────────┘
           │
           │ Expose metrics
           │ in Prometheus format
           ↓
┌─────────────────────┐
│   Prometheus        │
│   (scrapes :8000)   │
│   Port: 9090        │
└──────────┬──────────┘
           │
           │ Query metrics
           ↓
┌─────────────────────┐
│     Grafana         │
│  (visualizations)   │
│   Port: 3000        │
└─────────────────────┘
```

## Files Created/Modified

### New Files
1. **`metrics_collector.py`** - Python script that fetches packages and calculates completeness
2. **`requirements.txt`** - Python dependencies (prometheus-client, requests)
3. **`Dockerfile.metrics`** - Container image for the metrics collector
4. **`grafana/provisioning/dashboards/package-quality.json`** - Grafana dashboard

### Modified Files
1. **`docker-compose.yaml`** - Added metrics-collector service
2. **`prometheus/prometheus.yml`** - Added metrics-collector scrape config

## Metrics Exposed

The metrics collector exposes these Prometheus metrics:

### Main Metrics

1. **`charmhub_package_metadata_completeness{package_type}`** (Gauge)
   - Average percentage of completed fields across all packages
   - Labels: `package_type="charm"` or `package_type="bundle"`
   - Range: 0-100
   - Example: `charmhub_package_metadata_completeness{package_type="charm"} 73.5`

2. **`charmhub_package_metadata_completeness_distribution_bucket{package_type, le}`** (Histogram)
   - Distribution of completeness scores
   - Buckets: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
   - Useful for understanding how many packages are in each range

3. **`charmhub_incomplete_metadata_fields{field_name, package_type}`** (Gauge)
   - Number of packages missing each specific field
   - Example: `charmhub_incomplete_metadata_fields{field_name="icon",package_type="charm"} 42`
   - Helps identify which fields need attention

4. **`charmhub_total_packages{package_type}`** (Gauge)
   - Total number of packages
   - Used for context and validation

### Operational Metrics

5. **`charmhub_metrics_collection_errors_total`** (Counter)
   - Total errors during collection
   - Should be 0 under normal operation

6. **`charmhub_metrics_collection_duration_seconds`** (Histogram)
   - Time taken to collect all metrics
   - Useful for performance monitoring

## Setup Instructions

### 1. Start the Observability Stack

```bash
cd observability
docker-compose up -d
```

This will start:
- Grafana (http://localhost:3000)
- Prometheus (http://localhost:9090)
- Loki, Tempo, and other services
- **NEW**: Metrics Collector (http://localhost:8000)

### 2. Verify Metrics Collection

Check that the metrics collector is running:
```bash
docker-compose logs metrics-collector
```

You should see logs like:
```
INFO - Starting Prometheus metrics server on port 8000
INFO - Starting metrics collection (interval: 300s)
INFO - Fetching all packages from Charmhub API...
INFO - Fetched 450 packages
INFO - Charm: avg completeness=73.45%, total=380
INFO - Bundle: avg completeness=65.20%, total=70
INFO - Metrics collection completed in 8.23s
```

View raw metrics:
```bash
curl http://localhost:8000/metrics
```

### 3. Verify Prometheus Scraping

Open Prometheus (http://localhost:9090) and run these queries:

```promql
# Check if metric exists
charmhub_package_metadata_completeness

# View current completeness
charmhub_package_metadata_completeness{package_type="charm"}
charmhub_package_metadata_completeness{package_type="bundle"}

# See which fields are most commonly missing
topk(5, charmhub_incomplete_metadata_fields{package_type="charm"})
```

### 4. Open Grafana Dashboard

1. Go to http://localhost:3000
2. Login (default: admin/admin)
3. Navigate to **Dashboards** → **Package Metadata Quality**

The dashboard includes:
- **Gauge charts** showing average completeness for charms and bundles
- **Time series** tracking completeness trends over time
- **Bar charts** showing which fields are most commonly missing
- **Histograms** showing the distribution of completeness scores

## Configuration

### Environment Variables

The metrics collector supports these environment variables:

```bash
# Charmhub API endpoint
CHARMHUB_API_URL=https://api.charmhub.io/v2/charms

# How often to collect metrics (seconds)
COLLECTION_INTERVAL=300  # 5 minutes

# Port for Prometheus metrics endpoint
METRICS_PORT=8000

# API request timeout (seconds)
API_TIMEOUT=30
```

Edit these in `docker-compose.yaml` under the `metrics-collector` service.

### Prometheus Scrape Interval

The Prometheus scrape config is set to 60 seconds:

```yaml
scrape_configs:
  - job_name: 'metrics-collector'
    scrape_interval: 60s
```

This means Prometheus pulls metrics every minute, while the collector refreshes data every 5 minutes.

## Grafana Dashboard

The dashboard is automatically provisioned when Grafana starts. It includes:

### Row 1: Overview
- **Gauge**: Average Charm Metadata Completeness (%)
- **Gauge**: Average Bundle Metadata Completeness (%)
- **Stat**: Total Charms
- **Stat**: Total Bundles
- **Stat**: Collection Errors
- **Stat**: Collection Duration

### Row 2: Trends
- **Time Series**: Metadata Completeness Over Time
  - Shows trends for both charms and bundles
  - Threshold line at 85% (target)
  - Legend with last/mean/min/max values

### Row 3: Missing Fields Analysis
- **Bar Chart**: Charms Missing Metadata Fields
  - Horizontal bars showing count per field
  - Sorted by most missing
- **Bar Chart**: Bundles Missing Metadata Fields

### Row 4: Distribution
- **Bar Chart**: Charm Completeness Score Distribution
  - Shows how many packages fall into each 10% bucket
- **Bar Chart**: Bundle Completeness Score Distribution

### Color Thresholds

Completeness gauges use these thresholds:
- **Red**: 0-49% (Poor)
- **Orange**: 50-69% (Fair)
- **Yellow**: 70-84% (Good)
- **Green**: 85-100% (Excellent)

## Interpreting the Results

### What Good Looks Like

- **Completeness > 85%**: Excellent - Most metadata fields are filled
- **Increasing trend**: Publishing guidance is working
- **Few missing icons**: Visual presentation is good
- **Many docs links**: Packages are well-documented

### What Needs Attention

- **Completeness < 70%**: Many packages lack basic info
- **Decreasing trend**: Quality is declining, need intervention
- **Many missing categories**: Packages are hard to discover
- **Few screenshots**: Users can't preview functionality

### Action Items Based on Metrics

If you see:
- **Low icon coverage** → Improve icon validation in publishing UI
- **Missing descriptions** → Add required field validation
- **No documentation links** → Prompt publishers to add docs
- **Poor bundle completeness** → Focus guidance on bundle publishers

## Troubleshooting

### Metrics Not Appearing in Grafana

1. **Check if collector is running:**
   ```bash
   docker-compose ps metrics-collector
   ```

2. **Check collector logs:**
   ```bash
   docker-compose logs -f metrics-collector
   ```

3. **Verify Prometheus is scraping:**
   - Go to http://localhost:9090/targets
   - Look for `metrics-collector` job
   - Should show "UP" status

4. **Check raw metrics:**
   ```bash
   curl http://localhost:8000/metrics | grep charmhub
   ```

### Collector Errors

If you see API errors in logs:
```bash
# Check if API is accessible
curl -I https://api.charmhub.io/v2/charms/find

# Increase timeout if requests are slow
# Edit docker-compose.yaml:
environment:
  - API_TIMEOUT=60
```

### Dashboard Not Showing

1. **Check datasource:**
   - Grafana → Configuration → Data Sources
   - Prometheus should be listed and working

2. **Verify dashboard provisioning:**
   ```bash
   docker-compose exec grafana ls /etc/grafana/provisioning/dashboards/
   ```
   Should show `package-quality.json`

3. **Check for JSON errors:**
   ```bash
   docker-compose logs grafana | grep -i error
   ```

## Monitoring Best Practices

### Alerting (Future Enhancement)

Consider setting up alerts for:
- Completeness drops below 70%
- Collection errors > 0
- Collection duration > 60s

### Retention

Prometheus retains data for 15 days by default. For longer retention:
- Use Prometheus remote write to long-term storage
- Or increase retention: `--storage.tsdb.retention.time=90d`

### Performance

The collector:
- Fetches all packages in one API call
- Processes them in memory
- Takes ~5-15 seconds depending on package count
- Uses minimal CPU/memory

## Future Improvements

Potential enhancements:
1. **Parse metadata-yaml** to check keywords and license fields accurately
2. **Track completeness per publisher** to identify which publishers need help
3. **Add scoring weights** - some fields more important than others
4. **Send notifications** when completeness drops significantly
5. **Export to BigQuery** for historical analysis and reporting
6. **Add quality scores** beyond completeness (e.g., description length, image quality)

## API Reference

The collector uses the Charmhub API:

### Find Packages Endpoint
```
GET https://api.charmhub.io/v2/charms/find?fields=...
```

Fields requested:
- `result.summary`
- `result.title`
- `result.media`
- `result.categories`
- `result.publisher`
- `result.links`
- `default-release.revision.metadata-yaml`

## Support

For issues or questions:
1. Check logs: `docker-compose logs metrics-collector`
2. Verify Prometheus: http://localhost:9090/targets
3. Test metrics endpoint: `curl http://localhost:8000/metrics`
4. Check Grafana datasource configuration

## Contributing

To modify the metrics collection logic:
1. Edit `metrics_collector.py`
2. Rebuild: `docker-compose build metrics-collector`
3. Restart: `docker-compose restart metrics-collector`
4. Verify: `docker-compose logs -f metrics-collector`

To modify the dashboard:
1. Edit `grafana/provisioning/dashboards/package-quality.json`
2. Restart Grafana: `docker-compose restart grafana`
3. Refresh dashboard in browser
