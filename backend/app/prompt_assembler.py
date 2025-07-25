from .BasePrompt_builder import BasePromptBuilder
from .extended_prompt_builder import (
    build_topic_block,
    build_relation_block,
    build_sensitivity_block
)

def assemble_system_prompt(
    gender: str,
    mode: str,
    age: int,
    tf: str,
    emotion: str = None,
    topic: str = None,
    relation: str = None,
    sensitivity: str = None,
) -> str:
    # 1. 고정 프롬프트
    base = BasePromptBuilder(gender=gender, mode=mode, age=age, tf=tf).build()

    # 2. 동적 프롬프트 블록
    blocks = []
    # if emotion:
    #     blocks.append(build_emotion_block(emotion))
    if topic:
        blocks.append(build_topic_block(topic))
    if relation:
        blocks.append(build_relation_block(relation))
    if sensitivity:
        blocks.append(build_sensitivity_block(sensitivity))


    # 3. 조립
    return "\n\n".join([base] + blocks)
