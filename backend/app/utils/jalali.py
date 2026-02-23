import jdatetime
from datetime import date


def jalali_to_gregorian(jalali_str: str) -> date:
    """Convert '1404/11/08' to datetime.date"""
    parts = jalali_str.replace("-", "/").split("/")
    jd = jdatetime.date(int(parts[0]), int(parts[1]), int(parts[2]))
    return jd.togregorian()


def gregorian_to_jalali(d: date) -> str:
    """Convert datetime.date to '1404/11/08'"""
    jd = jdatetime.date.fromgregorian(date=d)
    return f"{jd.year:04d}/{jd.month:02d}/{jd.day:02d}"
