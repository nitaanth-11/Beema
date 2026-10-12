import io
import base64
from pathlib import Path
from typing import Tuple, List, Optional
from PIL import Image, ImageStat, ImageFilter
from src.utils.logger import get_logger

logger = get_logger("ImageQualityChecker")

class ImageQualityChecker:
    """
    Evaluates whether an uploaded claim photo is treatable, clear, and usable,
    or ambiguous, blurry, dark, and requires escalation to a human adjuster.
    """

    MIN_RESOLUTION = (150, 150)
    BLUR_THRESHOLD = 8.0          # Laplacian variance / edge contrast threshold
    MIN_LUMINANCE = 22.0          # Severe underexposure / pitch black
    MAX_LUMINANCE = 245.0         # Severe overexposure / washed out
    MIN_COLOR_ENTROPY = 2.0       # Flat / blank uniform image (pure solid color)

    @classmethod
    def load_image(cls, image_path: Optional[str] = None, image_base64: Optional[str] = None) -> Tuple[Optional[Image.Image], Optional[str]]:
        """
        Loads a PIL image from path or base64. Returns (Image, error_message).
        """
        try:
            if image_path:
                p = Path(image_path)
                if not p.exists():
                    return None, f"Image file not found at path: {image_path}"
                img = Image.open(p).convert("RGB")
                return img, None
            elif image_base64:
                # Remove data URI prefix if present
                if "," in image_base64:
                    image_base64 = image_base64.split(",", 1)[1]
                data = base64.b64decode(image_base64)
                img = Image.open(io.BytesIO(data)).convert("RGB")
                return img, None
            else:
                return None, "No image path or base64 data provided."
        except Exception as e:
            return None, f"Failed to decode image: {e}"

    @classmethod
    def evaluate_quality(cls, img: Image.Image) -> Tuple[bool, List[str], str]:
        """
        Checks image treatability.
        
        Returns:
            Tuple of (is_treatable: bool, flags: List[str], user_message: str)
        """
        flags: List[str] = []

        # 1. Resolution Check
        width, height = img.size
        if width < cls.MIN_RESOLUTION[0] or height < cls.MIN_RESOLUTION[1]:
            flags.append(f"LOW_RESOLUTION: Image size {width}x{height} below minimum {cls.MIN_RESOLUTION[0]}x{cls.MIN_RESOLUTION[1]}")

        # 2. Luminance & Exposure Check
        stat = ImageStat.Stat(img)
        mean_lum = sum(stat.mean) / len(stat.mean)
        if mean_lum < cls.MIN_LUMINANCE:
            flags.append(f"SEVERE_UNDEREXPOSURE: Mean luminance {mean_lum:.1f} is too dark to resolve damage features.")
        elif mean_lum > cls.MAX_LUMINANCE:
            flags.append(f"SEVERE_OVEREXPOSURE: Mean luminance {mean_lum:.1f} is washed out.")

        # 3. Variance & Flatness Check
        std_dev = sum(stat.stddev) / len(stat.stddev)
        if std_dev < cls.MIN_COLOR_ENTROPY:
            flags.append(f"UNIFORM_IMAGE: Standard deviation {std_dev:.1f} indicates blank or solid-color artifact.")

        # 4. Blur / Sharpness Check using Laplacian-like edge variance
        gray = img.convert("L")
        edges = gray.filter(ImageFilter.FIND_EDGES)
        edge_stat = ImageStat.Stat(edges)
        edge_contrast = edge_stat.stddev[0]
        if edge_contrast < cls.BLUR_THRESHOLD:
            flags.append(f"BLURRY_IMAGE: Edge contrast index {edge_contrast:.2f} is below sharpness threshold {cls.BLUR_THRESHOLD}.")

        # Determine Treatability
        if flags:
            logger.info(f"Image quality check flagged {len(flags)} issues: {flags}")
            return False, flags, "An agent will look forward to your matter."

        return True, [], "Image is clear and treatable for automated damage assessment."
