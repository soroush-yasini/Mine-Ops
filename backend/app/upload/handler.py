import io
import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
from typing import Dict

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_BASE = "/app/uploads"
PDF_MAGIC = b"%PDF"


@router.post("/image")
async def upload_image(file: UploadFile = File(...)) -> Dict[str, str]:
    content = await file.read()
    # Verify content is actually an image using Pillow
    try:
        img = Image.open(io.BytesIO(content))
        img.verify()
        fmt = (img.format or "jpeg").lower()
    except Exception:
        raise HTTPException(400, "File must be a valid image")
    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else fmt
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_BASE, "bol", filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    async with aiofiles.open(path, "wb") as f:
        await f.write(content)
    return {"url": f"/uploads/bol/{filename}", "path": path}


@router.post("/pdf")
async def upload_pdf(file: UploadFile = File(...)) -> Dict[str, str]:
    content = await file.read()
    # Verify content starts with PDF magic bytes
    if not content.startswith(PDF_MAGIC):
        raise HTTPException(400, "File must be a valid PDF")
    filename = f"{uuid.uuid4()}.pdf"
    path = os.path.join(UPLOAD_BASE, "lab_reports", filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    async with aiofiles.open(path, "wb") as f:
        await f.write(content)
    return {"url": f"/uploads/lab_reports/{filename}", "path": path}
