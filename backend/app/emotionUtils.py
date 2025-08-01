# utils/emotion_analyzer.py

#
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


    감정 단계 판단 기준 (키워드 중심 X, 분위기 중심 O) ->  감정처럼 모호한 영역에서는 "맥락 기반 판단"이 현실적인 해답이라고 생각함
    그만큼 결과의 일관성을 유지하기 위해 temperature 조정, 예시 강화, fallback 처리 등의 보완
    """
    prompt = f"""
    다음은 사용자의 하루를 요약한 문장입니다:

    \"{summary}\"

    당신은 감정 분석 전문가이며, 아래 기준에 따라 사용자의 감정 상태를 분석해 주세요.

    감정 상태는 1~5단계로 분류되며, 각 단계는 **단순 키워드가 아닌 문장의 전체 분위기와 감정 흐름**을 기반으로 판단해야 합니다.

    ✅ 감정 단계 기준:

    1: 매우 긍정적인 하루  
    - 성취감, 기쁨, 보람, 즐거움 등 강한 긍정 감정이 강조됨  
    - 하루의 핵심 내용이 명확한 긍정적 사건 2개 이상일 경우  

    2: 조금 긍정적인 하루  
    - 안도감, 소소한 행복, 기분 좋음 등이 느껴지지만  
    - 강도는 낮고, 긍정적인 느낌이 **짧게** 언급되거나 **가볍게** 표현된 경우  

    3: 잔잔한 하루 (중립)  
    - 감정 표현이 거의 없거나,  
    - 긍정과 부정이 균형을 이루며 전체 분위기가 평온한 경우  

    4: 조금 부정적인 하루  
    - 짜증, 피로, 스트레스 같은 부정 감정이 드러나지만  
    - 하루 전체가 매우 부정적이지는 않음  
    - 부분적으로 힘들었으나 회복된 느낌 등  

    5: 매우 부정적인 하루  
    - 눈물, 분노, 절망감, 극심한 스트레스 등 강한 부정 감정이 포함되며  
    - 하루 전체가 감정적으로 무겁고 지친 상태  

    📌 판단 시 참고사항:  
    - 단어 하나로 판단하지 말고, **전체 문장의 감정 흐름과 분위기**를 읽고 판단하세요.  
    - 예시:  
      - “오늘은 기쁜 일도 있었고 짜증나는 일도 있었지만 전반적으로 괜찮았어” → 3단계  
      - “너무 지치고 아무것도 하기 싫었어. 그냥 울고 싶었다” → 5단계  
      - “별일은 없었지만 친구랑 얘기 나누고 따뜻한 하루였어” → 2단계

    ⚠️ 위 기준을 바탕으로 오늘 하루의 감정 상태를 **정확히 숫자 하나 (1~5)** 로 출력하세요.  
다른 말은 절대 하지 마세요. 숫자 하나만 출력해주세요.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # 또는 "gpt-3.5-turbo"
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
