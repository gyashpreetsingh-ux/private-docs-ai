"""
Private Docs AI - Document Summaries API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.tools import SummaryRequest, SummaryResponse, SummaryExportRequest
from backend.app.services.summary_service import SummaryService

router = APIRouter(prefix="/summaries", tags=["Summaries"])


@router.post("/{document_id}", response_model=SummaryResponse)
async def generate_summary(
    document_id: str,
    request: SummaryRequest,
    db: Session = Depends(get_db),
):
    """
    Generate an AI summary (one_line, short, detailed, chapter_wise, takeaways, definitions) for a document.
    """
    service = SummaryService(db)
    return await service.generate_summary(document_id, request.summary_type)


@router.post("/export/download")
def export_summary_file(
    request: SummaryExportRequest,
    db: Session = Depends(get_db),
):
    """
    Export generated summary as a Markdown or Plain Text file.
    """
    service = SummaryService(db)
    export_path = service.export_summary(
        content=request.content,
        filename=request.filename or "summary",
        export_format=request.format,
    )

    media_type = "text/markdown" if request.format == "markdown" else "text/plain"
    return FileResponse(
        path=str(export_path),
        filename=export_path.name,
        media_type=media_type,
    )
