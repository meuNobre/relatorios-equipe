import json

class MemberRepository:

    @staticmethod
    def load():

        with open("data/members.json", "r", encoding="utf-8") as f:
            return json.load(f)