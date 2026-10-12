import argparse
import sys
import os
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from huggingface_hub import snapshot_download
from src.config import LAYA_MODEL_ID, LAYA_MODEL_DIR, LAYA_DEFAULT_SUBFOLDER
from src.utils.logger import get_logger

logger = get_logger("ModelDownloader")

REQUIRED_BASE_FILES = [
    "config.json",
    "model.safetensors",
    "rl_agent_config.json",
    "tokenizer/tokenizer_config.json",
    "tokenizer/tokenizer.json"
]

REQUIRED_TYPED_FILES = [
    "typed-decisions/encoder/config.json",
    "typed-decisions/model.safetensors",
    "typed-decisions/rl_agent_config.json",
    "typed-decisions/tokenizer/tokenizer_config.json",
    "typed-decisions/tokenizer/tokenizer.json"
]

def verify_local_files(model_dir: Path, subfolder: str = "typed-decisions") -> bool:
    """
    Verifies that the required checkpoint files exist locally.
    """
    logger.info(f"Verifying local model files in {model_dir} (subfolder={subfolder})...")
    files_to_check = REQUIRED_TYPED_FILES if subfolder == "typed-decisions" else REQUIRED_BASE_FILES
    
    missing = []
    for f in files_to_check:
        full_path = model_dir / f
        if not full_path.exists():
            missing.append(f)
        else:
            size_mb = full_path.stat().st_size / (1024 * 1024)
            logger.info(f"  [OK] Found: {f} ({size_mb:.2f} MB)")

    if missing:
        logger.warning(f"Missing {len(missing)} required files: {missing}")
        return False

    logger.info("All required model files are present and verified locally.")
    return True

def download_model(model_dir: Path, subfolder: str = "typed-decisions") -> bool:
    """
    Downloads only the specified checkpoint and tokenizer assets from Hugging Face.
    No authentication token is required for public download.
    """
    model_dir.mkdir(parents=True, exist_ok=True)

    if verify_local_files(model_dir, subfolder):
        logger.info(f"Model already fully cached in {model_dir}. Skipping download.")
        return True

    patterns = [
        "config.json",
        "rl_agent_config.json",
        "tokenizer/*",
    ]
    if subfolder == "typed-decisions":
        patterns.extend([
            "typed-decisions/*",
            "typed-decisions/encoder/*",
            "typed-decisions/tokenizer/*"
        ])
    else:
        patterns.append("model.safetensors")

    logger.info(f"Initiating targeted download for {LAYA_MODEL_ID} -> {model_dir}")
    logger.info(f"Patterns: {patterns}")

    try:
        snapshot_download(
            repo_id=LAYA_MODEL_ID,
            local_dir=str(model_dir),
            allow_patterns=patterns,
            local_dir_use_symlinks=False,
            token=None  # Public model, no token required
        )
        logger.info("Download completed successfully.")
        return verify_local_files(model_dir, subfolder)
    except Exception as e:
        logger.error(f"Download failed: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Download and verify LAYA model files locally")
    parser.add_argument("--model-dir", type=str, default=str(LAYA_MODEL_DIR),
                        help=f"Local target directory (default: {LAYA_MODEL_DIR})")
    parser.add_argument("--subfolder", type=str, default=LAYA_DEFAULT_SUBFOLDER,
                        choices=["typed-decisions", "english", "multilingual"],
                        help="Specific subfolder checkpoint to download")
    parser.add_argument("--verify-only", action="store_true",
                        help="Check if local files exist without downloading")

    args = parser.parse_args()
    target_dir = Path(args.model_dir)

    if args.verify_only:
        exists = verify_local_files(target_dir, args.subfolder)
        sys.exit(0 if exists else 1)
    else:
        success = download_model(target_dir, args.subfolder)
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
