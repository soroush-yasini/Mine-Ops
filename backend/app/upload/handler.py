import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_BASE = "/app/uploads"


@router.post("/image")
async def upload_image(file: UploadFile = File(...)) -> Dict[str, str]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_BASE, "bol", filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    async with aiofiles.open(path, "wb") as f:
        content = await file.read()
        await f.write(content)
    return {"url": f"/uploads/bol/{filename}", "path": path}


@router.post("/pdf")
async def upload_pdf(file: UploadFile = File(...)) -> Dict[str, str]:
    if file.content_type != "application/pdf":
        raise HTTPException(400, "File must be a PDF")
    filename = f"{uuid.uuid4()}.pdf"
    path = os.path.join(UPLOAD_BASE, "lab_reports", filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    async with aiofiles.open(path, "wb") as f:
        content = await file.read()
        await f.write(content)
    return {"url": f"/uploads/lab_reports/{filename}", "path": path}
