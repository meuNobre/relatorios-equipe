from typing import Dict, List
from pydantic import BaseModel, Field


class CyclePayload(BaseModel):
    id: str
    name: str


class MemberPayload(BaseModel):
    id: str
    nickname: str
    role: str
    date_joined: str = Field(description="Data no formato YYYY-MM-DD")
    departments: List[str]


class FeedbackPayload(BaseModel):
    department: str
    notes: Dict[str, str]


class ReportPayload(BaseModel):
    cycle: CyclePayload
    member: MemberPayload
    feedbacks: List[FeedbackPayload]
