import boto3
from dotenv import load_dotenv
import os

load_dotenv()

aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_REGION")

dynamodb = boto3.resource(
    "dynamodb",
    region_name=aws_region,
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key
)

table = dynamodb.Table("Characters")

characters = [
    {
        "character_id": "1",
        "name": "소금이",
        "description": "버터향 가득 짭짤 소금빵 친구",
        "rarity": "common",
        "image_url": "/images/breads/salt_bread.png",
        "category": "sweet"
    },
    {
        "character_id": "2",
        "name": "초코링",
        "description": "초콜릿이 가득한 도넛",
        "rarity": "common",
        "image_url": "/images/breads/choco_bread.png",
        "category": "sweet"
    },
    {
        "character_id": "3",
        "name": "딸기공주",
        "description": "딸기잼이 들어간 특별한 빵",
        "rarity": "common",
        "image_url": "/images/breads/strawberry_bread.png",
        "category": "sweet"
    },
    {
        "character_id": "4",
        "name": "초코머핀",
        "description": "초코칩이 콕콕 들어있는 달콤하고 부드러운 빵",
        "rarity": "common",
        "image_url": "/images/breads/chocomuffin.png",
        "category": "sweet"
    },
    {
        "character_id": "5",
        "name": "블루베리파이",
        "description": "상콤달콤한 블루베리가 듬뿍 들어간 파이",
        "rarity": "common",
        "image_url": "/images/breads/blueberry_pie.png",
        "category": "sweet"
    },
    {
        "character_id": "6",
        "name": "에그타르트",
        "description": "부드러운 에그필링이 듬뿍 들어간 타르트",
        "rarity": "common",
        "image_url": "/images/breads/egg_tart.png",
        "category": "savory"
    },
    {
        "character_id": "7",
        "name": "헤이즐넛빵",
        "description": "달콤 고소한 헤이즐넛의 풍미가 가득한 빵",
        "rarity": "common",
        "image_url": "/images/breads/hazelnut_bread.png",
        "category": "savory"
    },
    {
        "character_id": "8",
        "name": "레몬마들렌",
        "description": "상큼하고 부드러운 레몬향의 마들렌",
        "rarity": "common",
        "image_url": "/images/breads/lemon_bread.png",
        "category": "savory"
    },
    {
        "character_id": "9",
        "name": "팬케익",
        "description": "겹겹이 쌓인 팬케익과 버터의 조합",
        "rarity": "common",
        "image_url": "/images/breads/pancake.png",
        "category": "special"
    },
    {
        "character_id": "10",
        "name": "치즈빵",
        "description": "치즈가 쭉쭉 늘어나는 빵",
        "rarity": "common",
        "image_url": "/images/breads/cheese_bread.png",
        "category": "special"
    },
    {
        "character_id": "11",
        "name": "피자빵",
        "description": "부드러운 푸딩이 들어간 빵",
        "rarity": "common",
        "image_url": "/images/breads/pizza_bread.png",
        "category": "sweet"
    },
    {
        "character_id": "12",
        "name": "롤케익",
        "description": "돌돌 말린 부드러운 식감의 빵",
        "rarity": "common",
        "image_url": "/images/breads/rollcake.png",
        "category": "sweet"
    },
    {
        "character_id": "13",
        "name": "딸기케익",
        "description": "상큼한 딸기와 부드러운 생크림의 조합은 실패할 수가 없지",
        "rarity": "common",
        "image_url": "/images/breads/strawberrycake.png",
        "category": "sweet"
    },
    {
        "character_id": "14",
        "name": "카스테라",
        "description": "부드럽고 달콤한 카스테라",
        "rarity": "common",
        "image_url": "/images/breads/castella_bread.png",
        "category": "sweet"
    },
    {
        "character_id": "15",
        "name": "핫도그",
        "description": "길쭉한 소시지와 머스타트 케찹의 조화. 여기가 바로 뉴욕?",
        "rarity": "common",
        "image_url": "/images/breads/hotdog.png",
        "category": "sweet"
    },
    {
      "character_id": "16",
      "name": "햄버거",
      "description": "양상추 위에 순쇠고기 패티 두 장 특별한 소스 양상추 치즈 피클 양파까지",
      "rarity": "common",
      "image_url": "/images/breads/hamburger_bread.png",
      "category": "savory"
    },
    {
      "character_id": "17",
      "name": "허니베어",
      "description": "꿀이 뚝뚝 떨어지는 귀여운 곰 모양의 빵",
      "rarity": "rare",
      "image_url": "/images/breads/bear_bread.png",
      "category": "savory"
    },
    {
      "character_id": "18",
      "name": "옥수수빵",
      "description": "옥수수가 들어간 달콤 오독 옥수수모양의 빵",
      "rarity": "rare",
      "image_url": "/images/breads/corn_bread.png",
      "category": "savory"
    },
    {
      "character_id": "19",
      "name": "베이컨롤",
      "description": "바삭한 베이컨이 들어간 롤",
      "rarity": "rare",
      "image_url": "/images/breads/bacon_bread.png",
      "category": "savory"
    },
    {
      "character_id": "20",
      "name": "후르츠샌드",
      "description": "달콤한 여러가지 과일과 생크림 조합의 샌드위치. 피크닉 갈까?",
      "rarity": "rare",
      "image_url": "/images/breads/fruitsand.png",
      "category": "savory"
    },
    {
      "character_id": "21",
      "name": "라임마카롱",
      "description": "상큼하고 향긋한 라임 맛의 마카롱",
      "rarity": "rare",
      "image_url": "/images/breads/lime_macaron.png",
      "category": "savory"
    },
    {
      "character_id": "22",
      "name": "바닐라 킹",
      "description": "이렇게 큰 바닐라 슈 보신적 있으십니까?? 얼려먹어도 맛있는 바닐라 슈",
      "rarity": "rare",
      "image_url": "/images/breads/vanilla_bread.png",
      "category": "savory"
    },
    {
      "character_id": "23",
      "name": "바게트빵",
      "description": "길쭉한 바게트빵 들고 마틸다 따라해보기.. 어떠신가요?",
      "rarity": "rare",
      "image_url": "/images/breads/baguette.png",
      "category": "savory"
    },
    {
      "character_id": "24",
      "name": "푸딩",
      "description": "상콤하고 달콤한 푸딩! 먹지마세요. 피부에 양보하세요.",
      "rarity": "rare",
      "image_url": "/images/breads/pudding.png",
      "category": "savory"
    },
    {
      "character_id": "25",
      "name": "야채고로케",
      "description": "야~! 그거 고로케 하는거 아니야~! 야채고로케",
      "rarity": "rare",
      "image_url": "/images/breads/croquette.png",
      "category": "savory"
    },
    {
      "character_id": "26",
      "name": "아이스크림 와플",
      "description": "부드러운 아이스크림과.. 와플의 조합.. 와플대학 전액장학생 노려봅니다.",
      "rarity": "rare",
      "image_url": "/images/breads/waffle.png",
      "category": "savory"
    },
    {
      "character_id": "27",
      "name": "휘낭시에",
      "description": "겉바속쫀의 대명사... 휘낭시에",
      "rarity": "rare",
      "image_url": "/images/breads/financier.png",
      "category": "savory"
    },
    {
      "character_id": "28",
      "name": "민트초코쿠키",
      "description": "민트와 초코의 조합! 난 치약맛이 아니라구!",
      "rarity": "rare",
      "image_url": "/images/breads/mintchoco.png",
      "category": "savory"
    },
    {
      "character_id": "29",
      "name": "공주빵",
      "description": "queen never cry... but i'm a princess",
      "rarity": "epic",
      "image_url": "/images/breads/princess.png",
      "category": "savory"
    },
    {
      "character_id": "30",
      "name": "왕자빵",
      "description": "알 유 프린스쏭? 예아~!",
      "rarity": "epic",
      "image_url": "/images/breads/prince.png",
      "category": "savory"
    },
    {
      "character_id": "31",
      "name": "무지개빵",
      "description": "7가지 색깔의 신비한 빵",
      "rarity": "epic",
      "image_url": "/images/breads/rainbow_bread.png",
      "category": "special"
    },
    {
      "character_id": "32",
      "name": "별빛빵",
      "description": "별처럼 반짝이는 마법의 빵",
      "rarity": "epic",
      "image_url": "/images/breads/star_bread.png",
      "category": "special"
    },
    {
      "character_id": "33",
      "name": "솜사탕빵",
      "description": "후후 불면은... 구멍이 생기는 커다란 솜!사!탕!",
      "rarity": "epic",
      "image_url": "/images/breads/cottoncandy.png",
      "category": "special"
    },
    {
      "character_id": "34",
      "name": "고양이빵",
      "description": "거미로 그물쳐서 물고기 잡으러~!!! 나는.. 낭만고양이",
      "rarity": "epic",
      "image_url": "/images/breads/cat.png",
      "category": "special"
    },
    {
      "character_id": "35",
      "name": "트리쿠키",
      "description": "연말의 포근한 분위기까지 그대로 담은 크리스마스 트리모양의 쿠키",
      "rarity": "epic",
      "image_url": "/images/breads/christmastree_cookie.png",
      "category": "special"
    },
    {
      "character_id": "36",
      "name": "태양빵",
      "description": "너의 눈,코,입~ 그 태양 아닙니다. 온 세상을 밝혀주는 태양빵",
      "rarity": "epic",
      "image_url": "/images/breads/sun.png",
      "category": "special"
    },
    {
      "character_id": "37",
      "name": "용가리빵",
      "description": "라떼는... 내가 이 세계 짱이였다 이거야! 크아아아앙",
      "rarity": "legendary",
      "image_url": "/images/breads/legend_dragon_bread.png",
      "category": "special"
    },
    {
      "character_id": "38",
      "name": "달토끼빵",
      "description": "달에서 열심히 떡을 만들고 있는 달토끼입니다.",
      "rarity": "legendary",
      "image_url": "/images/breads/legend_moonrabbit.png",
      "category": "special"
    },
    {
      "character_id": "39",
      "name": "티벳여우빵",
      "description": "묘하게 생긴 티벳 여우입니다. 새앙토끼의 천적이죠.",
      "rarity": "legendary",
      "image_url": "/images/breads/dayeon.png",
      "category": "special"
    },
    {
      "character_id": "40",
      "name": "비숑빵",
      "description": "검은콩 3개 박힌 듯한.. 귀여운 강쥐.. 비숑이지요",
      "rarity": "legendary",
      "image_url": "/images/breads/minkyu.png",
      "category": "special"
    }


    ]

for char in characters:
    table.put_item(Item=char)

print("✅ 캐릭터 데이터 40개 업로드 완료!")
