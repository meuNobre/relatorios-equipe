from models.feedback import Feedback
from repositories.feedback_repository import FeedbackRepository

class FeedbackService:

    @staticmethod
    def get_all():

        data = FeedbackRepository.load()

        result = {}

        for nickname, feedbacks in data.items():

            member_feedbacks = []

            for department, notes in feedbacks.items():

                feedback = Feedback(
                    department=department,
                    notes=notes
                )

                member_feedbacks.append(feedback)

            result[nickname] = member_feedbacks

        return result