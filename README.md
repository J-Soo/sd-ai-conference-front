# AI 컨퍼런스 영상 생성기 - 관리자 프론트엔드

## 1. 개요

이 프로젝트는 PPT나 PDF 파일을 업로드하여 AI 기술을 활용한 발표 대본을 생성하는 서비스의 관리자용 프론트엔드입니다. 사용자 친화적인 인터페이스를 통해 파일 업로드, 대본 생성 요청, 생성 상태 확인 및 결과 조회 기능을 제공합니다.

## 2. 기술 스택

- **프레임워크**: React
- **HTTP 클라이언트**: Axios
- **스타일링**: CSS
- **개발 환경**: Create React App
- **배포**: Docker

## 3. 프로젝트 구조

```
frontend_admin/
├── public/                # 정적 파일
├── src/                   # 소스 코드
│   ├── api/               # API 호출 함수
│   │   └── generationApi.js # 백엔드 API 통신 함수
│   ├── components/        # 재사용 컴포넌트
│   │   ├── FileUploader.js  # 파일 업로드 컴포넌트
│   │   └── FileUploader.css # 파일 업로더 스타일
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── HomePage.js      # 홈페이지
│   │   └── GenerationStatusPage.js # 생성 상태 페이지
│   ├── hooks/             # 커스텀 훅
│   ├── contexts/          # Context API
│   ├── App.js             # 앱 컴포넌트
│   └── index.js           # 진입점
├── package.json           # 의존성 및 스크립트
├── Dockerfile             # 프로덕션 Docker 설정
├── Dockerfile.dev         # 개발용 Docker 설정
└── README.md              # 문서
```

## 4. 설치 및 실행 방법

### 로컬 개발 환경

**필수 조건:**
- Node.js 16.x 이상
- npm 또는 yarn

**설치:**

```bash
# 저장소 클론 후 프론트엔드 디렉토리로 이동
cd frontend_admin

# 의존성 설치
npm install
# 또는
yarn install
```

**개발 서버 실행:**

```bash
# 개발 서버 실행 (.env 파일에 설정된 환경변수 사용)
npm start
# 또는
yarn start
```

개발 서버는 기본적으로 http://localhost:3000 에서 실행됩니다.

### Docker를 사용한 실행

```bash
# 개발 환경
docker build -t frontend-admin-dev -f Dockerfile.dev .
docker run -p 3000:3000 -v $(pwd):/app frontend-admin-dev

# 프로덕션 환경
docker build -t frontend-admin -f Dockerfile .
docker run -p 3000:80 frontend-admin
```

## 5. 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하여 다음과 같은 환경 변수를 설정할 수 있습니다:

```
# 백엔드 API 기본 URL
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1

# 개발 모드 활성화
REACT_APP_DEBUG=true
```

## 6. 주요 기능 설명

### 파일 업로드

- 지원 파일 형식: PPT, PPTX, PDF
- 파일 선택 및 업로드 인터페이스
- 진행 상황 실시간 표시
- 오류 처리 및 사용자 피드백

### 대본 생성 옵션

- 스타일 선택: 전문적, 친근한, 학술적, 열정적
- 언어 선택: 한국어, 영어, 일본어, 중국어

### API 클라이언트

- `generateScript`: 문서 파일 업로드 및 대본 생성 요청 (파일, 스타일, 언어 정보 포함)
- `checkGenerationStatus`: 생성 작업 상태 확인
- `getGenerationResult`: 생성된 대본 결과 조회

## 7. 개발 가이드라인

### 코드 스타일

- 함수형 컴포넌트 및 Hooks 사용
- 컴포넌트 분리를 통한 재사용성 강화
- 일관된 에러 처리 패턴 유지

### 새 컴포넌트 추가

1. `src/components` 디렉토리에 컴포넌트 파일 생성
2. 필요한 경우 스타일 파일 함께 생성
3. 적절한 프롭 타입 정의
4. 재사용 가능한 로직은 커스텀 훅으로 분리

### API 호출 추가

1. `src/api` 디렉토리에 관련 함수 추가
2. Axios 인스턴스 활용
3. 일관된 에러 처리 패턴 적용

## 8. 배포

### 빌드

```bash
# 프로덕션 빌드 생성
npm run build
# 또는
yarn build
```

생성된 빌드 파일은 `build` 디렉토리에 저장됩니다.

### 배포 방법

1. 정적 호스팅 서비스(Netlify, Vercel, GitHub Pages 등) 사용
2. Docker 이미지 빌드 후 컨테이너 레지스트리에 푸시
3. Nginx나 다른 웹 서버를 통해 호스팅

## 9. 트러블슈팅

### API 연결 문제

- 백엔드 서버가 실행 중인지 확인
- CORS 설정 확인
- 환경 변수 `REACT_APP_API_BASE_URL` 설정 확인

### 빌드 오류

- 의존성 패키지 업데이트: `npm install` 또는 `yarn install`
- 노드 버전 확인: Node.js 16.x 이상 사용
- 캐시 정리: `npm cache clean --force` 또는 `yarn cache clean` 