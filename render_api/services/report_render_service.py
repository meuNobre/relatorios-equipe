from io import BytesIO

from models.feedback import Feedback
from models.member import Member
from render.renderer import ProfileRenderer
from render_api.schemas import ReportPayload


class ReportRenderService:
    """Converte o payload recebido pela API nos objetos que o renderizador antigo já entende."""

    @staticmethod
    def render_png(payload: ReportPayload) -> bytes:
        # O renderizador atual trabalha com objetos Member e Feedback.
        # Por isso, a API valida o JSON com Pydantic e depois adapta para esses modelos internos.
        member = Member(
            nickname=payload.member.nickname,
            role=payload.member.role,
            date_joined=payload.member.date_joined,
            departments=payload.member.departments,
        )

        feedbacks = [
            Feedback(department=feedback.department, notes=feedback.notes)
            for feedback in payload.feedbacks
        ]

        canvas = ProfileRenderer(member, feedbacks).render()

        # Em SaaS não podemos usar canvas.show(), porque isso abre uma janela local.
        # Aqui salvamos a imagem em memória e devolvemos os bytes PNG para o bot Discord.
        buffer = BytesIO()
        canvas.save(buffer, format="PNG")
        return buffer.getvalue()
