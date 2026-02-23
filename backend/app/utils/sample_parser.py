"""
Parse sample codes like 'A14041108K1':
  - Leading letters       = facility code (A=Hejazian, B=Shen Beton, C=Kavian)
  - Next 8 digits         = date YYYYMMDD (Jalali)
  - Remaining letters     = sample type code
  - Optional trailing int = sample_index
Returns None for any field that fails to parse, never raises.
"""
import re
from dataclasses import dataclass

_PATTERN = re.compile(
    r"^([A-Za-z]+)"          # facility code
    r"(\d{8})"               # 8-digit date
    r"([A-Za-z]+)"           # sample type code
    r"(\d+)?$"               # optional index
)


@dataclass
class ParsedSample:
    facility_code: str | None
    date_jalali: str | None        # formatted '1404/11/08'
    sample_type_code: str | None
    sample_index: int | None


def parse_sample_code(code: str) -> ParsedSample:
    """Parse a sample code string. Returns ParsedSample with None for unparseable fields."""
    if not code:
        return ParsedSample(None, None, None, None)

    try:
        m = _PATTERN.match(code.strip())
    except Exception:
        return ParsedSample(None, None, None, None)

    if not m:
        return ParsedSample(None, None, None, None)

    facility_code = None
    date_jalali = None
    sample_type_code = None
    sample_index = None

    try:
        facility_code = m.group(1).upper()
    except Exception:
        pass

    try:
        raw_date = m.group(2)
        year = int(raw_date[0:4])
        month = int(raw_date[4:6])
        day = int(raw_date[6:8])
        if 1 <= month <= 12 and 1 <= day <= 31:
            date_jalali = f"{year:04d}/{month:02d}/{day:02d}"
    except Exception:
        pass

    try:
        sample_type_code = m.group(3).upper()
    except Exception:
        pass

    try:
        raw_index = m.group(4)
        if raw_index is not None:
            sample_index = int(raw_index)
    except Exception:
        pass

    return ParsedSample(
        facility_code=facility_code,
        date_jalali=date_jalali,
        sample_type_code=sample_type_code,
        sample_index=sample_index,
    )
