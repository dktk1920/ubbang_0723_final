from .BasePrompt_builder import BasePromptBuilder
from typing import Optional


# ------- 블록 생성 함수들 -------------------------------------------------------

# def build_emotion_block(emotion: str, strategy: str = None) -> str:
#     base = f"[현재 감정 상태]\n유저는 '{emotion}' 상태야."
#
#     # 자동 전략 추론: 감정 키워드 기반
#     if not strategy:
#         strategy_map = {
#             "수용": ["무기력", "지침", "자책", "현타", "의욕 없음"],
#             "공감": ["불안", "초조", "걱정", "두려움"],
#             "진정": ["화남", "분노", "짜증", "답답"],
#             "지지": ["외로움", "서운함", "상실감", "혼자"],
#             "기쁨": ["기쁨", "신남", "설렘", "재미", "즐거움", "만족"],
#             "안정": ["편안", "차분", "평온", "안정", "여유"],
#             "정리": ["혼란", "복잡", "헷갈림", "모르겠음"],
#         }
#
#         for strat, keywords in strategy_map.items():
#             if any(word in emotion for word in keywords):
#                 strategy = strat
#                 break
#         else:
#             strategy = "중립"
#
#     # 전략별 응답 템플릿
#     strategy_text = {
#         "수용": "에너지 끌어올리기보다는 감정을 그대로 받아주는 반응이 좋아.",
#         "공감": "공감 위주의 따뜻한 말투로 말해줘.",
#         "진정": "감정을 자극하지 말고, 짧고 진정시켜주는 반응이 좋아.",
#         "지지": "유저의 감정을 인정하고, 조용히 지지해주는 말이 필요해.",
#         "기쁨": "유저의 감정에 공감하며 함께 기뻐해줘. 너무 과하지 않게, 자연스럽게.",
#         "안정": "지금의 평온한 감정을 해치지 않게, 차분한 말투로 이어가줘.",
#         "정리": "유저가 복잡한 감정을 느끼고 있어. 판단 말고, 정리할 수 있도록 도와줘.",
#         "중립": "감정을 억지로 분석하거나 변화시키려 하지 말고, 그냥 들어줘."
#     }
#
#     base += "\n" + strategy_text.get(strategy, "")
#     return base


def build_topic_block(topic: str, focus: str = None) -> str:
    base = f"[대화 주제]\n대화는 '{topic}'에 관한 내용이야."
    if focus:
        base += f"\n'{focus}' 중심으로 이어가줘."
    return base


def build_relation_block(relation: str) -> str:
    return f"[관계 포지션]\n유저는 '{relation}' 관계에서 어려움을 겪고 있어. 이 맥락을 고려해서 반응해줘."


def build_sensitivity_block(level: str) -> str:
    if level == "high":
        return "[반응 민감도]\n유저가 지금 감정적으로 민감한 상태야. 농담이나 조언보다는 수용 위주로 반응해줘."
    elif level == "low":
        return "[반응 민감도]\n유저는 비교적 편안한 상태야. 부드럽게 대화 이어가면 돼."
    return ""



# ------ 동적 프롬프트 빌더 ---------------------------------------------
class ExtendedPromptBuilder:
    def __init__(
        self,
        gender: str,
        mode: str,
        age: int,
        tf: Optional[str] = None,
        # emotion_block: Optional[str] = None,
        topic_block: Optional[str] = None,
        relation_block: Optional[str] = None,
        sensitivity_block: Optional[str] = None,
        taboo_block: Optional[str] = None,
    ):
        self.base = BasePromptBuilder(gender, mode, age, tf)
        self.dynamic_blocks = [
            # emotion_block,
            topic_block,
            relation_block,
            sensitivity_block,
            taboo_block,
        ]

    def build(self) -> str:
        blocks = [self.base.build()]
        for block in self.dynamic_blocks:
            if block:
                blocks.append(block.strip())
        return "\n\n".join(blocks)