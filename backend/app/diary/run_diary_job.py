from app.dynamo_utils import load_emotion_topic_logs, get_timestamp_range_for_yesterday
from app.diary.generator import generate_daily_diary # 너가 방금 보여준 함수
from MySql.database import SessionLocal
from MySql.models import User

def run_daily_diary_batch():
    db = SessionLocal()
    users = db.query(User).all()

    start_ts, end_ts = get_timestamp_range_for_yesterday()

    for user in users:
        pk = str(user.pk)
        logs = load_emotion_topic_logs(pk, start_ts, end_ts)
        generate_daily_diary(pk, logs)

    db.close()

if __name__ == "__main__":
    run_daily_diary_batch()
