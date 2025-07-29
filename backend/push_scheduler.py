import schedule
import time
import json
import datetime
from app.push_sender import send_push

SUBSCRIPTION_FILE = "subscriptions/latest.json"  # 경로는 상황에 따라 조정

def send_push_if_time():
    with open(SUBSCRIPTION_FILE, "r") as f:
        sub_data = json.load(f)
    notify_time = sub_data.get("notify_time", "22:00")
    now = datetime.datetime.now().strftime("%H:%M")
    if now == notify_time:
        send_push()

schedule.every(1).minutes.do(send_push_if_time)

print("⏰ 알림 예약 스케줄러 실행 중...")
while True:
    schedule.run_pending()
    time.sleep(1)
