from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

import pymupdf


MAX_PDF_SIZE_BYTES = 400 * 1024
PHONE_PATTERN = re.compile(
    r"(?<!\d)(?:\+?1[\s.()\-]*)?\(?[2-9]\d{2}\)?[\s.()\-]*"
    r"[2-9]\d{2}[\s.()\-]*\d{4}(?!\d)"
)
LOCAL_PATH_PATTERN = re.compile(
    r"(?:[A-Za-z]:[\\/]|/(?:Users|home)/[^/\s]+/)", re.IGNORECASE
)
PRIVATE_METADATA_FIELDS = (
    "title",
    "author",
    "subject",
    "keywords",
    "creator",
    "producer",
    "creationDate",
    "modDate",
    "trapped",
)


def validate_pdf(pdf_path: Path) -> list[str]:
    failures: list[str] = []

    if not pdf_path.is_file():
        return ["PDF does not exist"]

    if pdf_path.stat().st_size > MAX_PDF_SIZE_BYTES:
        failures.append("PDF exceeds the 400 KB size limit")

    try:
        with pymupdf.open(pdf_path) as document:
            extracted_text = "\n".join(page.get_text() for page in document)
            if PHONE_PATTERN.search(extracted_text):
                failures.append("PDF contains an extractable North American phone number")

            metadata = document.metadata or {}
            if any(metadata.get(field, "").strip() for field in PRIVATE_METADATA_FIELDS):
                failures.append("PDF contains private or toolchain metadata")

            if any(
                LOCAL_PATH_PATTERN.search(str(value))
                for value in metadata.values()
                if value
            ):
                failures.append("PDF metadata contains a local file path")
    except (RuntimeError, ValueError) as error:
        failures.append(f"PDF could not be parsed: {type(error).__name__}")

    return failures


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Reject sensitive text and metadata in a published resume PDF."
    )
    parser.add_argument("pdf", type=Path, help="PDF file to validate")
    args = parser.parse_args()

    failures = validate_pdf(args.pdf)
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1

    print("PASS: PDF contains no detected phone number or private metadata.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())