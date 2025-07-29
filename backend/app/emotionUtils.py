# utils/emotion_analyzer.py

import openai
import os
from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()  # .env에 OPENAI_API_KEY가 있을 경우

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
def get_emotion_level(summary: str) -> int:
    """
    GPT를 사용하여 summary 텍스트에서 감정 레벨(1~5)을 추출합니다.

    1: 매우 긍정적인 하루
    2: 조금 긍정적인 하루
    3: 잔잔한 하루 (중립)
    4: 조금 부정적인 하루
    5: 매우 부정적인 하루
    """
    prompt = f"""
아래는 사용자의 하루를 요약한 문장입니다:

\"{summary}\"

이 내용을 바탕으로 오늘 하루의 감정 상태를 다음 5가지 중 **하나의 숫자(1~5)** 로 판단해주세요:

1: 매우 긍정적인 하루 (기쁨, 행복, 성취감)
2: 조금 긍정적인 하루 (소소한 만족, 안도감)
3: 잔잔한 하루 (감정 변화 없음, 평범함)
4: 조금 부정적인 하루 (피로, 짜증, 우울감)
5: 매우 부정적인 하루 (분노, 눈물, 극심한 스트레스)

숫자 하나만 출력해주세요. 다른 말은 하지 마세요.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # 또는 "gpt-4-turbo"
            messages=[
                {"role": "system", "content": "너는 감정 분석 전문가야."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0
        )

        answer = response.choices[0].message.content.strip()
        print("🧠 GPT 응답 원본:", answer)
        level = int(answer)
        if level not in [1, 2, 3, 4, 5]:
            raise ValueError(f"예상하지 못한 숫자: {answer}")
        return level

    except Exception as e:
        print(f"❌ 감정 레벨 분석 오류: {e}")
        return 3  # fallback: 중립
