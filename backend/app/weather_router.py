from fastapi import APIRouter
from .contextual_info import generate_weather_summary
from .BasePrompt_builder import BasePromptBuilder

router = APIRouter()

@router.get("/api/weather-summary")
async def get_weather_summary():
    # system_prompt = BasePromptBuilder(gender="female", mode="banmal", age=20).build()
    result = await generate_weather_summary()
    if not result:
        return {"summary": "날씨 정보를 불러오지 못했어요.", "advice": ""}
    return result
