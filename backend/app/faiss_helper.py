import os
import uuid
from typing import List, Dict, Optional
from dotenv import load_dotenv
from langchain.schema import Document
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 환경변수 로드 및 임베딩 모델 초기화
load_dotenv()
embedding_model = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))

# 텍스트 분할 설정
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=30
)

# ✅ 중복 체크 함수 (유사도 기반)
# --------------------------------------------
def is_similar_to_existing(db: FAISS, text: str, threshold=0.1) -> bool:
    """
    FAISS가 반환한 유사도 score가 threshold 이하이면 중복으로 판단.
    FAISS는 L2 distance 기반 → score가 작을수록 유사.
    """
    docs_with_scores = db.similarity_search_with_score(text, k=10)
    for doc, score in docs_with_scores:
        if score <= threshold:
            print(f"⚠️ 중복 감지됨 (FAISS 점수 {score:.4f} ≤ {threshold}) → 저장 생략")
            return True
    return False




# ✅ 1. FAISS 저장 함수 (pk별로 저장)
def save_to_faiss(pk: str, messages: List[Dict[str, str]]):
    """
    주어진 메시지 리스트를 FAISS에 저장.
    각 메시지는 {"role": "user"/"assistant", "content": "..."} 형태
    """
    texts = []
    metadatas = []

    faiss_path = f"vectorstore/faiss_index/{pk}"
    os.makedirs(faiss_path, exist_ok=True)

    if os.path.exists(os.path.join(faiss_path, "index.faiss")):
        db = FAISS.load_local(faiss_path, embedding_model, allow_dangerous_deserialization=True)
    else:
        db = None

    for msg in messages:
        role_prefix = "[유저]" if msg["role"] == "user" else "[우빵]"
        text = f"{role_prefix} {msg['content']}"
        chunks = text_splitter.split_text(text)

        for chunk in chunks:
            # ✅ 중복 필터링
            if db and is_similar_to_existing(db, chunk):
                continue

            texts.append(chunk)
            metadatas.append({
                "pk": pk,
                "message_id": str(uuid.uuid4()),
                "role": msg["role"]
            })

    if not texts:
        print(f"⚠️ 중복으로 인해 저장할 텍스트 없음 (pk: {pk})")
        return

    if db:
        db.add_texts(texts, metadatas=metadatas)
    else:
        db = FAISS.from_texts(texts, embedding_model, metadatas=metadatas)

    db.save_local(faiss_path)
    print(f"✅ FAISS 저장 완료 ({pk}): {len(texts)}개 조각")



# ✅ 2. FAISS 유사도 검색 함수
def search_from_faiss(pk: str, query: str, k: int = 10) -> List[str]:
    """
    유저 쿼리에 대해 FAISS에서 유사한 메시지 top-k 검색 + 유사도 점수 출력
    """
    faiss_path = f"vectorstore/faiss_index/{pk}"
    if not os.path.exists(os.path.join(faiss_path, "index.faiss")):
        print(f"❗FAISS 인덱스 없음: {faiss_path}")
        return []

    db = FAISS.load_local(faiss_path, embedding_model, allow_dangerous_deserialization=True)

    # ✅ 유사도 점수 포함하여 검색
    docs_with_scores = db.similarity_search_with_score(query, k=k)  # ✅ 유사도 포함

    # ✅ 출력 로그 추가
    print(f"\n🧠 [FAISS 검색 결과: pk={pk}, query='{query}'] → top {len(docs_with_scores)}")
    for i, (doc, score) in enumerate(docs_with_scores, 1):
        print(f"{i}. 점수: {score:.4f}, 내용: {doc.page_content[:50]}...")

    return [doc.page_content for doc, _ in docs_with_scores]



# ✅ 3. FAISS 로드 함수 (옵션)
def load_faiss_index(pk: str) -> Optional[FAISS]:
    """
    FAISS 인덱스를 로드. 없으면 None 반환
    """
    try:
        faiss_path = f"vectorstore/faiss_index/{pk}"
        if not os.path.exists(os.path.join(faiss_path, "index.faiss")):
            return None
        return FAISS.load_local(faiss_path, embedding_model, allow_dangerous_deserialization=True)
    except Exception as e:
        print(f"[FAISS 로드 실패] {e}")
        return None