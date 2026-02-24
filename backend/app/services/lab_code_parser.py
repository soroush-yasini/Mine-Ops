import re
from typing import Optional

SAMPLE_TYPES = ["CR", "RC", "CH", "K", "L", "T", "F"]


def parse_lab_code(raw_code: str) -> dict:
    """
    Parse raw lab codes like B14041106CR2 into structured fields.
    Returns: {facility_code, year, month, day, sample_type, sample_index}
    """
    code = raw_code.strip()

    # Find 4-digit year in the code
    year_match = re.search(r'(\d{4})', code)
    if not year_match:
        return {"facility_code": None, "year": None, "month": None,
                "day": None, "sample_type": None, "sample_index": None}

    year_start = year_match.start()
    year_end = year_match.end()
    year = int(year_match.group(1))

    # facility_code is everything before the year
    facility_code = code[:year_start] if year_start > 0 else None

    # After year: next 4 digits are month+day
    after_year = code[year_end:]

    month = None
    day = None
    sample_type = None
    sample_index = None

    # Get month (2 digits) and day (2 digits)
    date_match = re.match(r'(\d{2})(\d{2})(.*)', after_year)
    if date_match:
        month = int(date_match.group(1))
        day = int(date_match.group(2))
        remainder = date_match.group(3)

        # Parse sample type from remainder
        for st in sorted(SAMPLE_TYPES, key=len, reverse=True):  # longest first
            if remainder.startswith(st):
                sample_type = st
                idx_str = remainder[len(st):]
                if idx_str.isdigit():
                    sample_index = int(idx_str)
                break
        else:
            if remainder:
                # Try to extract trailing digits as index
                m = re.match(r'([A-Za-z]+)(\d*)', remainder)
                if m:
                    sample_type = m.group(1)
                    sample_index = int(m.group(2)) if m.group(2) else None

    return {
        "facility_code": facility_code,
        "year": year,
        "month": month,
        "day": day,
        "sample_type": sample_type,
        "sample_index": sample_index,
    }


def compute_threshold_flag(sample_type: Optional[str], au_ppm: float) -> str:
    if sample_type == "K":
        if au_ppm > 2.5:
            return "high"
        elif au_ppm < 0.3:
            return "low"
        return "normal"
    elif sample_type == "T":
        return "high" if au_ppm > 0.2 else "normal"
    elif sample_type == "CR":
        if au_ppm < 200:
            return "low"
        elif au_ppm > 800:
            return "high"
        return "normal"
    elif sample_type == "RC":
        return "alert" if au_ppm > 0.5 else "normal"
    elif sample_type == "L":
        return "high" if au_ppm > 1.0 else "normal"
    else:
        return "normal"
