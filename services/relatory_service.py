from io import BytesIO

from services.member_service import MemberService
from services.feedback_service import FeedbackService
from render.renderer import ProfileRenderer


class RelatoryService:

    @staticmethod
    def generate_all():
        """Fluxo legado: lê os JSONs locais e abre as imagens na máquina."""
        members = MemberService.get_all()
        feedbacks = FeedbackService.get_all()

        for nickname, member in members.items():
            canvas = ProfileRenderer(
                member,
                feedbacks[nickname]
            ).render()

            canvas.show()

    @staticmethod
    def render_png(member, feedbacks):
        """Fluxo SaaS: gera o relatório como bytes PNG, sem abrir janela local."""
        canvas = ProfileRenderer(member, feedbacks).render()
        buffer = BytesIO()
        canvas.save(buffer, format="PNG")
        return buffer.getvalue()
