## 날씨 API 호출에만 이용되는 코드

import requests
import os
from dotenv import load_dotenv

load_dotenv()
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

def get_weather_data(city="서울"):
    city_map_ko_en = {
        "서울": "Seoul",
        "부산": "Pusan",
        "인천": "Incheon",
        "대구": "Daegu",
        "대전": "Daejeon",
        "광주": "Gwangju",
        "수원": "Suwon",
        "울산": "Ulsan",
        "전주": "Jeonju",
        "청주": "Cheongju"
    }

    city_query = city_map_ko_en.get(city, city)
    url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={city_query}&lang=ko"
    response = requests.get(url)
    data = response.json()

    if "location" not in data:
        return None

    city_name_map = {v: k for k, v in city_map_ko_en.items()}
    english_name = data["location"]["name"]
    korean_name = city_name_map.get(english_name, english_name)
    condition_text = data["current"]["condition"]["text"]
    temperature = data["current"]["temp_c"]
    icon = data["current"]["condition"].get("icon", "")

    return {
        "city": korean_name,
        "condition": condition_text,
        "temperature": temperature,
        "icon": icon
    }