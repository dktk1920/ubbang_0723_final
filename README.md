실시간 감정 기반 챗봇 + 감정일기 서비스

백엔드: Python (PyTorch, Transformers 사용), API 서버 구축

프론트엔드: Next.js 기반 UI, WebSocket으로 실시간 채팅 연결

주요 기능:

실시간 감정 분석 및 공감 대화

감정일기 자동 생성 (API 호출)

사용자 정보 기반 개인화

배포: Docker로 프론트엔드/백엔드 컨테이너화 → AWS ECR 업로드 → AWS EKS에 배포

인프라:

Load Balancer Controller + Helm + eksctl → 로드밸런싱

Karpenter → 오토스케일링 최적화

기타: 비용 최적화, requirements.txt 경량화, 환경변수 기반 API 통신
