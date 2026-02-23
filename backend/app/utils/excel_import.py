"""
Generic Excel import utility for Mine-Ops.
Supports both Persian and English column headers via a mapping dict.
"""
from typing import Any

import openpyxl


def import_excel(
    file_path: str,
    column_map: dict[str, str],
    required_columns: list[str] | None = None,
) -> tuple[list[dict[str, Any]], list[str]]:
    """
    Read an Excel file and return (rows, errors).

    Args:
        file_path:        Path to the .xlsx file.
        column_map:       Mapping of header variants (Persian or English) → canonical field name.
                          e.g. {"تاریخ": "date_jalali", "Date": "date_jalali"}
        required_columns: Canonical field names that must be present in the file.

    Returns:
        rows:   List of dicts keyed by canonical field names.
        errors: List of error message strings (empty on success).
    """
    errors: list[str] = []
    rows: list[dict[str, Any]] = []

    try:
        wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
    except Exception as exc:
        return rows, [f"Cannot open Excel file: {exc}"]

    ws = wb.active
    raw_rows = list(ws.iter_rows(values_only=True))
    wb.close()

    if not raw_rows:
        return rows, ["Excel file is empty"]

    # Build header → canonical field mapping from first row
    header_row = raw_rows[0]
    col_index: dict[str, int] = {}  # canonical_name → column index
    for idx, cell in enumerate(header_row):
        if cell is None:
            continue
        cell_str = str(cell).strip()
        if cell_str in column_map:
            canonical = column_map[cell_str]
            col_index[canonical] = idx

    # Validate required columns
    if required_columns:
        missing = [c for c in required_columns if c not in col_index]
        if missing:
            return rows, [f"Missing required columns: {missing}"]

    canonical_fields = list(col_index.keys())

    for row_num, row in enumerate(raw_rows[1:], start=2):
        # Skip entirely empty rows
        if all(v is None for v in row):
            continue
        record: dict[str, Any] = {}
        for field in canonical_fields:
            idx = col_index[field]
            val = row[idx] if idx < len(row) else None
            record[field] = val
        rows.append(record)

    return rows, errors
