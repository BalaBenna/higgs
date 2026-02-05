from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api")


class ScrapeRequest(BaseModel):
    url: str
    auto_analyze: bool = True


class ScrapeResponse(BaseModel):
    product_name: str
    product_description: str
    images: list[str]
    favicon: str
    site_name: str


def _is_valid_image_url(url: str) -> bool:
    """Filter out tracking pixels, data URIs, tiny icons, and SVGs."""
    if not url or url.startswith("data:"):
        return False
    lower = url.lower()
    # Skip common non-product images
    skip_patterns = [
        "tracking",
        "pixel",
        "spacer",
        "blank",
        "1x1",
        ".svg",
        "analytics",
        "beacon",
        "facebook.com",
        "google-analytics",
        "doubleclick",
    ]
    return not any(p in lower for p in skip_patterns)


def _normalize_url(url: str, base_url: str) -> str:
    """Normalize relative URLs to absolute."""
    if url.startswith("//"):
        parsed_base = urlparse(base_url)
        return f"{parsed_base.scheme}:{url}"
    if url.startswith("/") or not urlparse(url).scheme:
        return urljoin(base_url, url)
    return url


def _extract_product_data(html: str, url: str) -> ScrapeResponse:
    """Extract product data from HTML."""
    soup = BeautifulSoup(html, "lxml")

    # Extract product name
    og_title = soup.find("meta", property="og:title")
    title_tag = soup.find("title")
    product_name = ""
    if og_title and og_title.get("content"):
        product_name = og_title["content"].strip()
    elif title_tag and title_tag.string:
        product_name = title_tag.string.strip()

    # Extract description
    og_desc = soup.find("meta", property="og:description")
    meta_desc = soup.find("meta", attrs={"name": "description"})
    product_description = ""
    if og_desc and og_desc.get("content"):
        product_description = og_desc["content"].strip()
    elif meta_desc and meta_desc.get("content"):
        product_description = meta_desc["content"].strip()

    # Extract images
    images: list[str] = []

    # OG image first
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        img_url = _normalize_url(og_image["content"].strip(), url)
        if _is_valid_image_url(img_url) and img_url not in images:
            images.append(img_url)

    # Product images from common selectors
    for img in soup.find_all("img", src=True):
        if len(images) >= 20:
            break
        img_url = _normalize_url(img["src"].strip(), url)
        if _is_valid_image_url(img_url) and img_url not in images:
            # Skip tiny images (likely icons)
            width = img.get("width", "")
            height = img.get("height", "")
            try:
                if width and int(width) < 50:
                    continue
                if height and int(height) < 50:
                    continue
            except (ValueError, TypeError):
                pass
            images.append(img_url)

    # Also check srcset
    for img in soup.find_all("img", srcset=True):
        if len(images) >= 20:
            break
        srcset = img["srcset"]
        # Take the first URL from srcset
        first_src = srcset.split(",")[0].strip().split(" ")[0]
        if first_src:
            img_url = _normalize_url(first_src, url)
            if _is_valid_image_url(img_url) and img_url not in images:
                images.append(img_url)

    # Favicon
    favicon = ""
    icon_link = soup.find("link", rel=lambda x: x and "icon" in x)
    if icon_link and icon_link.get("href"):
        favicon = _normalize_url(icon_link["href"].strip(), url)
    else:
        favicon = _normalize_url("/favicon.ico", url)

    # Site name
    og_site = soup.find("meta", property="og:site_name")
    site_name = ""
    if og_site and og_site.get("content"):
        site_name = og_site["content"].strip()
    else:
        parsed = urlparse(url)
        site_name = parsed.hostname or ""

    return ScrapeResponse(
        product_name=product_name,
        product_description=product_description,
        images=images[:20],
        favicon=favicon,
        site_name=site_name,
    )


@router.post("/scrape-product")
async def scrape_product(req: ScrapeRequest) -> ScrapeResponse:
    """Scrape product data from a URL."""
    # Validate URL
    parsed = urlparse(req.url)
    if not parsed.scheme or not parsed.hostname:
        raise HTTPException(status_code=400, detail="Invalid URL")

    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Invalid URL scheme")

    try:
        timeout = httpx.Timeout(15.0)
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }
        async with httpx.AsyncClient(
            timeout=timeout, follow_redirects=True, headers=headers
        ) as client:
            response = await client.get(req.url)
            response.raise_for_status()
            html = response.text

        return _extract_product_data(html, req.url)
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timed out")
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch URL: HTTP {e.response.status_code}",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape URL: {str(e)}")
