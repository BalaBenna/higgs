"""Tests for the product scraper router."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import httpx
from routers.product_scraper_router import _extract_product_data, _is_valid_image_url, _normalize_url


class TestIsValidImageUrl:
    def test_filters_data_uris(self):
        assert _is_valid_image_url("data:image/png;base64,abc") is False

    def test_filters_empty(self):
        assert _is_valid_image_url("") is False

    def test_filters_tracking_pixels(self):
        assert _is_valid_image_url("https://example.com/tracking/pixel.gif") is False

    def test_filters_svg(self):
        assert _is_valid_image_url("https://example.com/icon.svg") is False

    def test_filters_analytics(self):
        assert _is_valid_image_url("https://google-analytics.com/img.png") is False

    def test_accepts_valid_jpg(self):
        assert _is_valid_image_url("https://example.com/product.jpg") is True

    def test_accepts_valid_png(self):
        assert _is_valid_image_url("https://example.com/hero.png") is True


class TestNormalizeUrl:
    def test_absolute_url_unchanged(self):
        assert _normalize_url("https://img.com/a.jpg", "https://example.com") == "https://img.com/a.jpg"

    def test_relative_path(self):
        assert _normalize_url("/images/a.jpg", "https://example.com/product/1") == "https://example.com/images/a.jpg"

    def test_protocol_relative(self):
        assert _normalize_url("//cdn.example.com/a.jpg", "https://example.com") == "https://cdn.example.com/a.jpg"

    def test_relative_no_slash(self):
        result = _normalize_url("img/a.jpg", "https://example.com/products/")
        assert result.startswith("https://")
        assert "a.jpg" in result


class TestExtractProductData:
    def test_extracts_og_metadata(self):
        html = """
        <html>
        <head>
            <meta property="og:title" content="Awesome Product" />
            <meta property="og:description" content="A great product for everyone" />
            <meta property="og:image" content="https://example.com/product.jpg" />
            <meta property="og:site_name" content="ExampleStore" />
        </head>
        <body></body>
        </html>
        """
        result = _extract_product_data(html, "https://example.com/product/1")
        assert result.product_name == "Awesome Product"
        assert result.product_description == "A great product for everyone"
        assert "https://example.com/product.jpg" in result.images
        assert result.site_name == "ExampleStore"

    def test_extracts_title_fallback(self):
        html = """
        <html>
        <head><title>My Product Page</title></head>
        <body></body>
        </html>
        """
        result = _extract_product_data(html, "https://example.com")
        assert result.product_name == "My Product Page"

    def test_extracts_meta_description_fallback(self):
        html = """
        <html>
        <head><meta name="description" content="Fallback description" /></head>
        <body></body>
        </html>
        """
        result = _extract_product_data(html, "https://example.com")
        assert result.product_description == "Fallback description"

    def test_no_images_returns_empty(self):
        html = "<html><head><title>No images</title></head><body><p>Text only</p></body></html>"
        result = _extract_product_data(html, "https://example.com")
        assert result.images == []

    def test_normalizes_relative_image_urls(self):
        html = """
        <html><body>
        <img src="/images/product.jpg" />
        </body></html>
        """
        result = _extract_product_data(html, "https://example.com/page")
        assert len(result.images) > 0
        assert result.images[0] == "https://example.com/images/product.jpg"

    def test_max_20_images(self):
        imgs = "".join(f'<img src="https://example.com/img{i}.jpg" />' for i in range(30))
        html = f"<html><body>{imgs}</body></html>"
        result = _extract_product_data(html, "https://example.com")
        assert len(result.images) <= 20

    def test_filters_tiny_images(self):
        html = """
        <html><body>
        <img src="https://example.com/tiny.png" width="10" height="10" />
        <img src="https://example.com/big.jpg" width="800" height="600" />
        </body></html>
        """
        result = _extract_product_data(html, "https://example.com")
        assert len(result.images) == 1
        assert "big.jpg" in result.images[0]

    def test_favicon_extraction(self):
        html = """
        <html><head>
        <link rel="icon" href="/favicon.png" />
        </head><body></body></html>
        """
        result = _extract_product_data(html, "https://example.com")
        assert result.favicon == "https://example.com/favicon.png"

    def test_favicon_fallback(self):
        html = "<html><head></head><body></body></html>"
        result = _extract_product_data(html, "https://example.com")
        assert result.favicon == "https://example.com/favicon.ico"

    def test_site_name_fallback_to_hostname(self):
        html = "<html><head></head><body></body></html>"
        result = _extract_product_data(html, "https://www.mystore.com/product")
        assert result.site_name == "www.mystore.com"


class TestScrapeProductEndpoint:
    """Tests that require the FastAPI test client."""

    @pytest.fixture
    def client(self):
        from fastapi.testclient import TestClient
        from routers.product_scraper_router import router
        from fastapi import FastAPI

        app = FastAPI()
        app.include_router(router)
        return TestClient(app)

    def test_invalid_url_returns_400(self, client):
        response = client.post("/api/scrape-product", json={"url": "not-a-url"})
        assert response.status_code == 400

    def test_invalid_scheme_returns_400(self, client):
        response = client.post("/api/scrape-product", json={"url": "ftp://example.com"})
        assert response.status_code == 400

    @patch("routers.product_scraper_router.httpx.AsyncClient")
    def test_timeout_returns_504(self, mock_client_cls, client):
        mock_instance = AsyncMock()
        mock_instance.__aenter__ = AsyncMock(return_value=mock_instance)
        mock_instance.__aexit__ = AsyncMock(return_value=False)
        mock_instance.get = AsyncMock(side_effect=httpx.TimeoutException("timeout"))
        mock_client_cls.return_value = mock_instance

        response = client.post(
            "/api/scrape-product",
            json={"url": "https://example.com/product"},
        )
        assert response.status_code == 504

    @patch("routers.product_scraper_router.httpx.AsyncClient")
    def test_valid_url_returns_product_data(self, mock_client_cls, client):
        html = """
        <html><head>
        <meta property="og:title" content="Test Product" />
        <meta property="og:description" content="A test description" />
        <meta property="og:image" content="https://example.com/img.jpg" />
        </head><body></body></html>
        """
        mock_response = MagicMock()
        mock_response.text = html
        mock_response.status_code = 200
        mock_response.raise_for_status = MagicMock()

        mock_instance = AsyncMock()
        mock_instance.__aenter__ = AsyncMock(return_value=mock_instance)
        mock_instance.__aexit__ = AsyncMock(return_value=False)
        mock_instance.get = AsyncMock(return_value=mock_response)
        mock_client_cls.return_value = mock_instance

        response = client.post(
            "/api/scrape-product",
            json={"url": "https://example.com/product"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["product_name"] == "Test Product"
        assert data["product_description"] == "A test description"
        assert "https://example.com/img.jpg" in data["images"]
