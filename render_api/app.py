from fastapi import FastAPI
from fastapi.responses import Response

from render_api.schemas import ReportPayload
from render_api.services.report_render_service import ReportRenderService

app = FastAPI(
    title="MyFeedback Render API",
    description="API Python responsável apenas por gerar a imagem final do relatório.",
    version="1.0.0",
)


@app.get("/health")
def health():
    """Endpoint simples para o bot verificar se a API Python está online."""
    return {"status": "ok"}


@app.post("/reports/render")
def render_report(payload: ReportPayload):
    """
    Recebe os dados já consolidados pelo bot e devolve uma imagem PNG.

    Importante: a regra de negócio fica no bot. Esta API só transforma dados em imagem.
    """
    image_bytes = ReportRenderService.render_png(payload)

    return Response(
        content=image_bytes,
        media_type="image/png",
        headers={"Content-Disposition": "inline; filename=report.png"},
    )
