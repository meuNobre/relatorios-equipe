import json

class FeedbackRepository:

    @staticmethod
    def load():

        with open("data/feedbacks.json", "r", encoding="utf-8") as f:
            return json.load(f)