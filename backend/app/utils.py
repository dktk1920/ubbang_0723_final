# ------------------ 기본 유틸: 날짜 변환 ----------------------------
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from collections import defaultdict, Counter
import os
from openai import OpenAI

# ⏰ 타임존 설정
KST = timezone(timedelta(hours=9))
KST_ZONEINFO = ZoneInfo("Asia/Seoul")

def get_diary_date_from_timestamp(ts: int) -> str:
    """
    timestamp를 기준으로 '감정일기 날짜'를 계산
    기준: 새벽 6시 기준으로 하루 시작
    """
    dt = datetime.fromtimestamp(ts, tz=KST)
    if dt.hour < 6:
        dt -= timedelta(days=1)
    return dt.strftime("%Y-%m-%d")


def get_time_block(ts: int) -> str:
    """
    타임스탬프 기반으로 시간대를 '오전', '오후', '저녁'으로 분류
    """
    hour = datetime.fromtimestamp(ts, tz=KST_ZONEINFO).hour
    if hour < 12:
        return "오전"
    elif hour < 18:
        return "오후"
    else:
        return "저녁"


def group_logs_by_time_block(logs: list[dict]) -> dict[str, list[dict]]:
    """
    로그들을 '오전' / '오후' / '저녁' 시간대별로 묶는다.
    """
    blocks = defaultdict(list)
    for log in logs:
        block = get_time_block(log["timestamp"])
        blocks[block].append(log)
    return blocks


def get_dominant_emotion_topic_from_logs(logs: list[dict]) -> tuple[str, str]:
    """
    감정, 주제를 쌍으로 묶어 가장 많이 등장한 조합을 반환
    """
    pairs = [(e.strip(), log["topic"]) for log in logs for e in log["emotion"].split(", ")]
    if not pairs:
        return "무감정", "없음"
    dominant = Counter(pairs).most_common(1)[0][0]
    return dominant

# ------------------ ✍️ 감정일기 텍스트 요약 ----------------------------

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_diary_from_messages(messages: list[str]) -> str:
    """
    사용자 메시지를 기반으로 감정 그림일기 요약 생성 (GPT 호출)
    """
    message_text = "\n".join(messages)

    prompt = f"""
    다음은 한 사용자의 하루 동안의 대화 내용입니다:

    {message_text}
    이 대화를 바탕으로 오늘 하루를 마무리하는 감정 일기를 3~5줄로 작성해주세요.

    조건:
    - 사용자가 직접 한 말이나 표현만 바탕으로 써야 해요
    - 창작/과장/추측은 절대 금지에요. 
    - 사람 이름, 장소, 시간, 감정 표현 등은 대화 내용에 없는 건 절대 새로 만들지 마세요.
    - 보고서나 분석체가 아닌, 사용자가 직접 쓰는 편한 말투여야 합니다.
    - 감정이나 사건을 새로 지어내거나 해석하지 마세요.
    - 감정을 덧붙이지 말고, 대화 속에서 드러난 느낌만 자연스럽게 담아주세요.
    - 너무 시적이거나 과장된 표현은 피해주세요
    - 오늘 하루의 감정 흐름이 자연스럽게 드러나야 합니다
    - 힘들었던 점, 위로받고 싶은 마음, 소소한 위안 등을 중심으로 정리해주세요
    - 마치 일기장에 쓰는 것처럼 써주세요 (진짜 내가 말하는 듯한 느낌으로)
    예: “기대됐다, 행복했다, 위로받았다” 같은 말은 내가 직접 하지 않았다면 쓰지 마세요.
    """

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt.strip()}]
    )
    return response.choices[0].message.content.strip()


# ------------------ 🎨 감정 기반 이미지 프롬프트 ----------------------------
def ask_gpt_for_image_prompt_from_summary(summary: str) -> str:
    """
    감정일기 요약을 바탕으로 DALL·E에 적합한 귀엽고 만화 스타일의 프롬프트를 생성합니다.
    - 애니메이션/카툰 스타일, 파스텔톤, 희망적이고 따뜻한 분위기
    - 출력은 반드시 영어 한 문장, 100자 이내
    """
    prompt = f"""
    You are creating a beautiful illustration prompt for DALL·E 3.

    🎯 Reference Style:
    A dreamy kawaii-style night scene, soft vintage texture, thick outlines, chibi shapes, pastel colors, sparkles, magical mood — like Sanrio or Japanese sticker illustrations.

    📘 Diary Summary:
    \"\"\"{summary}\"\"\"
    🎨 Visual Style Rules:
    - Sanrio-style or Japanese sticker illustration
    - Dot eyes only, minimal facial expression
    - Chubby, round proportions, thick black outlines
    - Flat pastel colors with vintage paper texture
    - No glossy eyes, no glossy lighting, no hair detail!!!!!!! plz
    - Characters must be symbolic, simplified, and not realistic
    - Keep the composition simple and avoid overly decorative or flashy elements
    - Do not include any text, letters, signs, or writing in the image !!!!! plz!!!!!!
    
    📌 Prompt Instructions:
    - Focus on emotional storytelling through cozy or imaginative scenes
    - Output only the prompt sentence, no explanation

    Generate now:
    """.strip()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content.strip()


# ------------------ 📅 오늘 날짜/시간 문자열 유틸 ----------------------------

def get_today_datetime_info():
    now = datetime.now(KST_ZONEINFO)
    date_str = now.strftime("%Y년 %m월 %d일")

    weekday_map = {
        "Monday": "월요일",
        "Tuesday": "화요일",
        "Wednesday": "수요일",
        "Thursday": "목요일",
        "Friday": "금요일",
        "Saturday": "토요일",
        "Sunday": "일요일"
    }
    weekday_eng = now.strftime("%A")
    weekday_str = weekday_map.get(weekday_eng, weekday_eng)

    hour = now.strftime("%I")
    minute = now.strftime("%M")
    meridiem = now.strftime("%p").replace("AM", "오전").replace("PM", "오후")
    time_str = f"{meridiem} {int(hour)}시 {int(minute)}분"

    return {
        "date": date_str,
        "weekday": weekday_str,
        "time": time_str
    }

# ------------------ 🏙️ 메시지 내 지역 추출 ----------------------------

def extract_city_from_message(msg: str) -> str:
    cities = ["서울", "인천", "부산", "대구", "광주", "대전", "울산", "제주", "수원", "청주", "전주", "창원"]
    for city in cities:
        if city in msg:
            return city
    return "서울"



# ---------------- "📝 너에게 남기는 말"---------------------------------------------------------

def generate_warm_message_from_summary(summary: str) -> str:
    """
    감정일기 요약을 기반으로, 사용자의 하루에 다정한 한마디를 생성 (GPT 호출)
    """
    prompt = f"""
    너는 사용자의 감정일기를 읽고, 다정하고 따뜻한 말을 건네주는 AI 친구야.

    다음은 사용자의 감정일기 요약이야:

    \"\"\"{summary}\"\"\"

    아래 조건을 지켜서, 진심 어린 한마디를 만들어줘:

    - 반드시 한국어로 말해줘
    - 너무 길지 않게, 5~10줄 정도의 짧은 위로 말풍선 형식
    - 유저의 감정 변화나 상황을 공감해주고, 정서적으로 따뜻한 말투로 말해줘
    - "잘 자, 나." 또는 "내일은 오늘보다 조금 더 가볍길 바라." 같은 문장으로 마무리해줘
    - 과도하게 시적이거나 과장된 문장은 피하고, 친근하고 포근한 말투로

    예를 들어:
    “하루 동안 참 많은 생각이 오갔던 것 같아. 그래도 너는 잘 버텼고, 그게 참 대단한 일이야. 잘 자, 나.”
    이런 느낌처럼, 부담 없이 받아들일 수 있는 메시지를 만들어줘.
    """


    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt.strip()}],
        temperature=0.8,
    )

    return response.choices[0].message.content.strip()