import json
import os
from pywebpush import webpush, WebPushException
from dotenv import load_dotenv

load_dotenv()

print("🔍 .env 로드 확인")
print("📦 PRIVATE:", os.getenv("VAPID_PRIVATE_KEY"))
print("📬 EMAIL:", os.getenv("VAPID_EMAIL"))



VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_EMAIL = os.getenv("VAPID_EMAIL")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SUBSCRIPTION_FILE = os.path.join(BASE_DIR, "../subscriptions/latest.json")
print("📂 실제 구독 파일 경로:", os.path.abspath(SUBSCRIPTION_FILE))

def send_push():
    try:
        with open(SUBSCRIPTION_FILE, "r") as f:
            sub_data = json.load(f)

        subscription_info = {
            "endpoint": sub_data["endpoint"],
            "keys": sub_data["keys"]
        }

        payload = json.dumps({
            "title": "👋 체크인 시간이에요!",
            "body": "오늘 하루 어땠는지 일기 쓰러 와주세요 😊",
            "url": "http://localhost:3000"
        })

        webpush(
            subscription_info,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": f"mailto:{VAPID_EMAIL}"
            }
        )

        print("✅ 푸시 발송 성공!")

    except WebPushException as ex:
        print("❌ 푸시 발송 실패:", ex)
    except FileNotFoundError:
        print("⚠️ 구독 정보 파일이 존재하지 않습니다.")

if __name__ == "__main__":
    send_push()
