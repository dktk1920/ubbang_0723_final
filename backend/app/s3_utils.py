import requests
import boto3

s3 = boto3.client("s3")
BUCKET_NAME = "mindchat-diary"

def upload_image_to_s3_from_url(url: str, pk: str, date: str) -> str:
    print("📤 이미지 업로드 시도:", url)
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"이미지 다운로드 실패: {response.status_code}")

    filename = f"diary/{pk}/{date}.jpg"
    print("📝 파일명:", filename)
    print("📦 응답 바이트 크기:", len(response.content))

    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=filename,
        Body=response.content,
        ContentType="image/jpeg",
    )

    s3_url = f"https://{BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/{filename}"
    print("✅ 업로드 성공:", s3_url)
    return s3_url
