# 🚀 Pedia.page 배포 체크리스트

## ✅ 배포 확인사항

### 기본 기능 테스트
- [ ] 사이트 로딩 확인
- [ ] 로고 및 아이콘 표시 확인
- [ ] 플래시카드 생성 기능 테스트
- [ ] 언어 변경 기능 테스트
- [ ] 모바일 반응형 확인

### 성능 체크
- [ ] 페이지 로딩 속도 (3초 이내)
- [ ] 이미지 최적화 확인
- [ ] CSS/JS 번들링 확인

### 보안 체크
- [ ] HTTPS 연결 확인
- [ ] 환경 변수 노출 확인
- [ ] API 키 보안 확인

### SEO 체크
- [ ] 메타 태그 확인
- [ ] Open Graph 태그
- [ ] 파비콘 표시 확인

## 🌍 커스텀 도메인 설정 (선택사항)

### Cloudflare에서 도메인 연결:
1. Pages 프로젝트 → "Custom domains"
2. "Set up a domain" 클릭
3. 도메인 입력 및 DNS 설정
4. SSL 인증서 자동 발급 대기

### DNS 설정 예시:
```
CNAME www pedia-page.pages.dev
CNAME @ pedia-page.pages.dev (또는 ALIAS)
```

## 📊 모니터링

### Cloudflare Analytics 확인:
- 트래픽 통계
- 성능 메트릭
- 오류 로그

### Google Gemini API 사용량:
- API 호출 수 모니터링
- 비용 관리
- 사용 한도 확인

## 🔧 향후 개선사항

- [ ] PWA 기능 추가
- [ ] 오프라인 모드 지원
- [ ] 사용자 생성 콘텐츠 저장 (R2)
- [ ] 이미지 최적화 (Outorek)
- [ ] 사용자 인증 시스템
