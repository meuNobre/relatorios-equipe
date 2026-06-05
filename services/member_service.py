from models.member import Member
from repositories.member_repository import MemberRepository

class MemberService:

    @staticmethod
    def get_all():

        data = MemberRepository.load()

        members = {}

        for nickname, info in data.items():

            member = Member(
                nickname=nickname,
                role=info["role"],
                date_joined=info["date_joined"],
                departments=info["departments"]
            )

            members[nickname] = member

        return members