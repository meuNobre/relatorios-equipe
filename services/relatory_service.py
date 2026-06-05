from services.member_service import MemberService
from services.feedback_service import FeedbackService
from render.renderer import ProfileRenderer

class RelatoryService:

    @staticmethod
    def generate_all():

        members = MemberService.get_all()

        feedbacks = FeedbackService.get_all()

        for nickname, member in members.items():

            canvas = ProfileRenderer(
                member,
                feedbacks[nickname]
            ).render()

            canvas.show()