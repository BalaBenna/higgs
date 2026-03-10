"""
Recraft Creative Upscale tool via Replicate API.

Creative Upscale enhances details and refines complex elements — it doesn't just
increase resolution but adds depth by improving textures, fine details, and
facial features.
"""

import asyncio
import os
import traceback

from pydantic import BaseModel, Field
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig

from common import DEFAULT_PORT
from services.config_service import config_service, FILES_DIR
from tools.utils.image_utils import (
    process_input_image,
    get_image_info_and_save,
    generate_image_id,
)
from tools.utils.image_canvas_utils import save_image_to_canvas
from utils.http_client import HttpClient


class RecraftCreativeUpscaleInputSchema(BaseModel):
    """Input schema for Recraft Creative Upscale"""

    input_images: list[str] = Field(
        description="The image(s) to upscale. Only the first image is used."
    )
    prompt: str = Field(
        default="upscale",
        description="Unused for upscaling, kept for schema compatibility.",
    )


@tool(
    "creative_upscale_by_recraft_replicate",
    description="Creative upscale images using Recraft AI via Replicate. Enhances details, textures, fine details, and facial features beyond simple resolution increase.",
    args_schema=RecraftCreativeUpscaleInputSchema,
)
async def creative_upscale_by_recraft_replicate(
    input_images: list[str],
    config: RunnableConfig,
    prompt: str = "upscale",
) -> str:
    """Creative upscale using Recraft AI via Replicate API"""
    if not input_images or len(input_images) == 0:
        return "Error: Recraft Creative Upscale requires an input image."

    ctx = config.get("configurable", {})
    canvas_id = ctx.get("canvas_id", "")
    session_id = ctx.get("session_id", "")
    user_id = ctx.get("user_id", "")

    # Get Replicate API key
    replicate_config = config_service.app_config.get("replicate", {})
    api_key = replicate_config.get("api_key", "")
    if not api_key:
        return "Error: Replicate API key is not configured. Set REPLICATE_API_KEY or configure it in settings."

    try:
        # Process input image (convert local path to data URI if needed)
        processed_image = await process_input_image(input_images[0])
        if not processed_image:
            return f"Error: Could not process input image: {input_images[0]}"

        # Call Replicate API for recraft-ai/recraft-creative-upscale (async polling)
        url = "https://api.replicate.com/v1/models/recraft-ai/recraft-creative-upscale/predictions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        data = {"input": {"image": processed_image}}

        print("🎨 Recraft Creative Upscale request", flush=True)

        async with HttpClient.create_aiohttp() as session:
            # Submit prediction
            async with session.post(url, headers=headers, json=data) as response:
                res = await response.json()
                print(f"🎨 Recraft prediction created: status={response.status}", flush=True)
                if response.status >= 400:
                    print(f"🎨 Recraft error body: {res}", flush=True)
                    detail = res.get("detail", "")
                    error_msg = res.get("error", "")
                    return f"Error: Recraft Creative Upscale failed: {detail or error_msg or str(res)}"

            # Poll for completion
            prediction_url = res.get("urls", {}).get("get", "")
            status = res.get("status", "")
            output_url = res.get("output", "")

            poll_count = 0
            while status in ("starting", "processing") and prediction_url:
                poll_count += 1
                await asyncio.sleep(2)
                async with session.get(prediction_url, headers={"Authorization": f"Bearer {api_key}"}) as poll_resp:
                    res = await poll_resp.json()
                    status = res.get("status", "")
                    output_url = res.get("output", "")
                    if poll_count % 5 == 0:
                        print(f"🎨 Recraft polling... status={status}, count={poll_count}", flush=True)

            print(f"🎨 Recraft final status: {status}, polls={poll_count}", flush=True)

            if status == "failed":
                error_msg = res.get("error", "unknown error")
                return f"Error: Recraft Creative Upscale failed: {error_msg}"
            if status == "canceled":
                return "Error: Recraft Creative Upscale was canceled"

        if not output_url:
            detail = res.get("detail", "")
            error_msg = res.get("error", "")
            return f"Error: Recraft Creative Upscale failed: {detail or error_msg or 'no output URL in response'}"

        # Save the upscaled image
        image_id = generate_image_id()
        file_path_without_ext = os.path.join(FILES_DIR, image_id)
        mime_type, width, height, extension = await get_image_info_and_save(
            output_url, file_path_without_ext
        )
        filename = f"{image_id}.{extension}"

        # Read bytes for Supabase upload, then clean up local file
        image_bytes = None
        full_path = f"{file_path_without_ext}.{extension}"
        if user_id and os.path.exists(full_path):
            with open(full_path, "rb") as f:
                image_bytes = f.read()
            try:
                os.remove(full_path)
            except Exception:
                pass

        # Save to canvas (uploads to Supabase if image_bytes available)
        image_url = await save_image_to_canvas(
            session_id,
            canvas_id,
            filename,
            mime_type,
            width,
            height,
            user_id=user_id,
            image_bytes=image_bytes,
            prompt=prompt,
            model="recraft-ai/recraft-creative-upscale",
            provider="replicate",
            feature_type=ctx.get("feature_type", ""),
        )

        if image_url.startswith("http"):
            return f"image generated successfully ![image_id: {filename}]({image_url})"
        return f"image generated successfully ![image_id: {filename}](http://localhost:{DEFAULT_PORT}{image_url})"

    except Exception as e:
        print(f"Error in Recraft Creative Upscale: {e}")
        traceback.print_exc()
        return f"Error: Recraft Creative Upscale failed: {str(e)}"


__all__ = ["creative_upscale_by_recraft_replicate"]
