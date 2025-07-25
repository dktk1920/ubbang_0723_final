# # backend/app/emotion_inference.py
#
# import os
# from typing import Optional
# from openai import AsyncOpenAI
# from dotenv import load_dotenv
#
# load_dotenv()  # ✅ .env에서 OPENAI_API_KEY를 환경변수로 로딩
#
# client = AsyncOpenAI()
#
# # 이하 동일
# EXTRACTION_PROMPT_TEMPLATE = """
#
#
# 가능한 경우 감정은 감정 사전이나 표정, 어조, 강조 등에 근거해 판단하고,
# 단순 정보 전달일 경우는 감정을 "없음" 또는 "중립"으로 표시하세요.
# 다음 사용자 발화에 명확한 감정 표현이 있는 경우, 주된 감정 1~2개를 추출하세요.
#
# 사용자가 단순한 관찰을 말한 건가요, 감정을 표현한 건가요?
# 단순한 요청, 질문, 정보 전달일 경우에는 "감정 없음" 또는 "중립"으로 표시하세요.
#
# 대답은 감정 이름만. 다른 말 없이 형식 그대로 보여줘.
# 절대 감정을 설명하거나 해석하지 마.
#
#
# 예시:
# - "비가 너무 많이 오네ㅠㅠ 언제까지 올까?" → 중립
# - "하.. 오늘 진짜 너무 힘들어" → 피로, 슬픔
# - "너 진짜 왜 그래?" → 분노, 실망
# - "나랑 무슨 대화 하고있는지 기억해봐!" → 중립 ❗
#
# 출력 형식: 주된 감정 2개 또는 없음/중립
# 입력:
# "{user_text}"
# →
# """
#
# async def extract_emotion(user_text: str) -> Optional[str]:
#     prompt = EXTRACTION_PROMPT_TEMPLATE.format(user_text=user_text.strip())
#
#     try:
#         response = await client.chat.completions.create(
#             model="gpt-4",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.3,
#         )
#         print(f"[extract_emotion] 유저 입력: {user_text}")
#         print(f"[extract_emotion] GPT 응답: {response.choices[0].message.content.strip()}")
#         return response.choices[0].message.content.strip()
#     except Exception as e:
#         print(f"[emotion_inference] 감정 추출 오류: {e}")
#         return None
#

