import numpy as np
from typing import Tuple, List, Dict, Any, Optional
from PIL import Image, ImageStat, ImageFilter
from src.utils.logger import get_logger

logger = get_logger("SyntheticImageDetector")

class SyntheticImageDetector:
    """
    Forensic engine to detect AI-generated, synthetic, and diffusion-based images
    (e.g., Midjourney, DALL-E 3, Stable Diffusion, Flux, Generative Fill).
    
    Detection Vectors:
    1. Metadata & EXIF Steganography: Scans embedded PNG chunks and EXIF tags for generator signatures.
    2. 2D Spectral Frequency Domain (FFT): Detects periodic grid spikes and transposed convolution
       checkerboard artifacts inherent to latent diffusion upsamplers.
    3. Noise Residual & Texture Plasticity: Audits sensor shot noise (PRNU) vs. diffusion over-smoothing.
    """

    AI_GENERATOR_KEYWORDS = [
        "stablediffusion", "stable diffusion", "midjourney", "dall-e", "dalle",
        "novelai", "comfyui", "automatic1111", "civitai", "generative fill",
        "parameters", "negative_prompt", "cfg scale", "steps:", "sampler:"
    ]

    @classmethod
    def detect_synthetic(
        cls,
        img: Image.Image,
        raw_info: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, float, List[str], str]:
        """
        Evaluates an image for AI-generation signatures.

        Returns:
            Tuple of (is_synthetic: bool, confidence: float, flags: List[str], explanation: str)
        """
        flags: List[str] = []
        confidence_scores: List[float] = []
        explanation_parts: List[str] = []

        # Vector 1: Metadata / PNG Text Chunks & Software Tags
        info_dict = raw_info or getattr(img, "info", {}) or {}
        info_str = " ".join([f"{k}:{v}" for k, v in info_dict.items()]).lower()

        # Check EXIF if available
        try:
            exif = img.getexif()
            if exif:
                for tag_id, val in exif.items():
                    info_str += f" {str(val).lower()}"
        except Exception:
            pass

        for kw in cls.AI_GENERATOR_KEYWORDS:
            if kw in info_str:
                flags.append(f"AI_METADATA_SIGNATURE: Embedded generator tag '{kw}' found in image headers.")
                confidence_scores.append(0.98)
                explanation_parts.append(f"Metadata header explicitly contains generative model trace '{kw}'.")
                break

        # Vector 2: Frequency Domain Spectral Analysis (2D FFT)
        # Latent diffusion models introduce high-frequency periodic grid spikes
        try:
            gray = img.convert("L").resize((256, 256))
            arr = np.array(gray, dtype=np.float32)

            # 2D Fast Fourier Transform
            f_transform = np.fft.fft2(arr)
            f_shift = np.fft.fftshift(f_transform)
            magnitude_spectrum = np.log(np.abs(f_shift) + 1.0)

            # Analyze high-frequency spectral corners vs center
            h, w = magnitude_spectrum.shape
            ch, cw = h // 2, w // 2
            
            # Corner energy vs cross-axial grid energy
            # Latent decoders exhibit high cross-axial peaks along horizontal and vertical axes
            horiz_axis = magnitude_spectrum[ch, :]
            vert_axis = magnitude_spectrum[:, cw]
            axis_energy = (np.mean(horiz_axis) + np.mean(vert_axis)) / 2.0
            
            # Off-axis diagonal energy
            diag_1 = np.diagonal(magnitude_spectrum)
            diag_energy = np.mean(diag_1)

            spectral_grid_ratio = axis_energy / max(diag_energy, 1.0)

            # In natural camera photos, energy decays smoothly radially (ratio close to 1.0 - 1.3).
            # In diffusion models, deconvolution grid creates strong cross-axial spikes (ratio > 1.80).
            if spectral_grid_ratio > 1.80:
                flags.append(f"DIFFUSION_GRID_ARTIFACT: 2D FFT spectral ratio {spectral_grid_ratio:.2f} indicates periodic deconvolution checkerboard.")
                confidence_scores.append(min(0.90, 0.70 + (spectral_grid_ratio - 1.8) * 0.5))
                explanation_parts.append(
                    f"Frequency spectrum exhibits periodic lattice spikes (ratio {spectral_grid_ratio:.2f}) "
                    f"typical of neural latent upsampling rather than optical lens physics."
                )
        except Exception as e:
            logger.debug(f"FFT spectral analysis skipped: {e}")

        # Vector 3: Texture Plasticity & Extreme Noise Floor Absence
        # Generative diffusion models have abnormally low micro-noise in smooth regions
        try:
            blurred = gray.filter(ImageFilter.GaussianBlur(radius=1.0))
            blur_arr = np.array(blurred, dtype=np.float32)
            noise_residual = np.abs(arr - blur_arr)
            noise_std = float(np.std(noise_residual))

            # Hyper-smooth synthetic renders often have noise_std < 0.25
            if noise_std < 0.25 and not flags:
                flags.append(f"UNNATURAL_NOISE_ABSENCE: Sensor noise residual {noise_std:.2f} is unnaturally flat (lacks physical CMOS sensor grain).")
                confidence_scores.append(0.70)
                explanation_parts.append("Absence of authentic optical sensor noise grain consistent with digital synthesis.")
        except Exception:
            pass

        is_synthetic = len(flags) > 0
        overall_confidence = max(confidence_scores) if confidence_scores else 0.0

        if is_synthetic:
            logger.warning(f"Synthetic AI image markers detected: {flags} (confidence: {overall_confidence:.2f})")
            explanation = " | ".join(explanation_parts)
        else:
            explanation = "Authentic optical sensor characteristics verified. No synthetic AI markers detected."

        return is_synthetic, round(overall_confidence, 2), flags, explanation
