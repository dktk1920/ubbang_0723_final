from app.dynamo_utils import get_messages_for_diary, save_diary_to_dynamo
from app.utils import generate_diary_from_messages, ask_gpt_for_image_prompt_from_summary, get_dominant_emotion_topic_from_logs
from openai import OpenAI
import os
from app.s3_utils import upload_image_to_s3_from_url

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_daily_diary(pk: str, diary_date: str):
    print(f"📥 감정일기 생성 요청 pk={pk}, 날짜={diary_date}")

    # 1. 메시지 불러오기
    messages = get_messages_for_diary(pk, diary_date)
    if not messages:
        print(f"⚠️ 유저 {pk} ({diary_date}) 사용자 메시지 없음 → 일기 생략")
        return

    # 2. 요약 생성
    summary = generate_diary_from_messages(messages)

    # 3. 이미지 프롬프트 생성 → 이미지 생성
    image_prompt = ask_gpt_for_image_prompt_from_summary(summary)
    image_response = client.images.generate(
        model="dall-e-3",
        prompt=image_prompt,
        size="1024x1024",
        quality="standard",
        style="vivid",
        n=1
    )
    image_url = image_response.data[0].url if image_response.data else None
    if not image_url:
        print("❌ 이미지 URL 없음")
        return
    # ✅ 여기서 테스트해보자!
    print("✅ 최종 이미지 URL 테스트:", image_url)

    # 4. S3 업로드
    try:
        image_url = upload_image_to_s3_from_url(image_url, pk, diary_date)
    except Exception as e:
        print("❌ 이미지 업로드 실패:", e)
        return

    # 5. 저장
    diary_id=save_diary_to_dynamo(pk, diary_date, summary, image_url)
    print(f"✅ 감정 그림일기 저장 완료 ({pk}/{diary_date})")
    return diary_id