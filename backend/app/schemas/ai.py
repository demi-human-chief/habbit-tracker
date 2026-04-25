from pydantic import BaseModel, Field


class CoachRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class CoachResponse(BaseModel):
    answer: str
