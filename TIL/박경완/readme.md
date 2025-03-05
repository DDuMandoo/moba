# 📌 목차
- [2025.03.05 TIL](#20250305-til)
- [2025.03.04 TIL](#20250304-til)


---

## 2025.03.05 TIL

### Today's Keywords
`LLM` `Tokenizer` `RAG`

### 오늘 배운 것
1. LLM (Large Language Model) 사용 방법
- Open AI, Google, Anthropic 등에서 제공하는 API를 통해 LLM을 사용할 수 있음
- Python 친화적 (강의 상), Java도 API를 호출할 수 있음(OkHttp)
```python
import openai

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "LLM이란 무엇인가요?"}]
)
print(response["choices"][0]["message"]["content"])
```

```java
import okhttp3.*;
import org.json.JSONObject;

public class OpenAIExample {
    public static void main(String[] args) throws Exception {
        OkHttpClient client = new OkHttpClient();

        JSONObject json = new JSONObject();
        json.put("model", "gpt-4");
        json.put("messages", new JSONArray()
            .put(new JSONObject().put("role", "user").put("content", "LLM이란 무엇인가요?")));

        RequestBody body = RequestBody.create(json.toString(), MediaType.get("application/json"));
        Request request = new Request.Builder()
            .url("https://api.openai.com/v1/chat/completions")
            .post(body)
            .addHeader("Authorization", "Bearer YOUR_API_KEY")
            .build();
        
        Response response = client.newCall(request).execute();
        System.out.println(response.body().string());
    }
}
```

2. Tokenizer 이해
- Tokenizer는 LLM이 텍스트를 처리할 때 사용하는 단위로, 단어 또는 서브워드로 분할
- LLM이 입력을 받을 때, 텍스트를 토큰 단위로 변환 후 숫자 벡터로 처리

```python
import tiktoken

encoder = tiktoken.get_encoding("cl100k_base")
text = "Hello, how are you?"
tokens = encoder.encode(text)

print("토큰 개수:", len(tokens))
print("토큰화된 값:", tokens)
```

3. RAG (Retrieval-Augmented Generation)
- LLM이 사전에 학습된 데이터만 활용하는 것이 아닌 __외부 지식 베이스에서 관련 정보를 검색__ 후 답변 생성
- 검색 기반 질문 응답 시스템에서 많이 사용되며 최신 정보 반영 가능
- OpenAI API 또는 LangChain 같은 프레임워크를 활용해 구현 가능 (강의에서는 LangChain 사용)
```python
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.vectorstores import FAISS
from langchain.embeddings.openai import OpenAIEmbeddings

# LLM과 벡터 검색 DB 초기화
llm = ChatOpenAI(model_name="gpt-4", openai_api_key="YOUR_API_KEY")
embedding_model = OpenAIEmbeddings()
vector_db = FAISS.load_local("my_vector_store", embedding_model)

# 검색 기반 질문 응답 시스템 구축
qa = RetrievalQA.from_chain_type(llm=llm, retriever=vector_db.as_retriever())

response = qa.run("한국의 수도는 어디인가요?")
print(response)
```
- RAG 모델은 FAQ 챗봇, 검색 보조 AI, 기술 문서 자동 답변 시스템 등에서 활용 가능

추가) LLM 사용 시 주의점
- 토큰 비용 관리 : API 호춫 시 토큰 개수를 줄이도록 프롬프트 최적화 필수
- 보안 : API 키 유출 주의, 사용자 입력 검증 필요 (프롬프트 인젝션)
- 결과 검증 : LLM이 생성하는 정보의 신뢰성 검토 필요 (Hallucination)

---

## 2025.03.05 TIL

### Today's Keywords
`JPA` `Transaction` `AOP`

### 오늘 배운 것
1. Spring의 `@Transactional` 동작 방식
- Spring의 AOP를 활용하여 트랜잭션을 관리하며, 프록시 패턴을 사용해 메서드 호출 시 트랜잭션을 적용함
- 트랜잭션이 시작될 때 Connection을 획득하고, 커밋 또는 롤백 시점에 반영됨

2. 트랜잭션의 전파(propagation) 옵션
- `REQUIRED`: 기본값, 기존 트랜잭션이 있으면 참여, 없으면 새로 생성
- `REQUIRES_NEW`: 기존 트랜잭션을 중단하고 새로운 트랜잭션을 생성
- `NESTED`: 기존 트랜잭션 내부에서 중첩된 트랜잭션 생성
트랜잭션 롤백 조건

3. 기본적으로 RuntimeException 또는 Error가 발생하면 롤백
- `@Transactional(rollbackFor = Exception.class)`을 사용하면 Checked Exception도 롤백 가능

4. 프록시 내부 호출 문제
- 같은 클래스 내에서 `@Transactional` 메서드를 호출하면 프록시가 적용되지 않아 트랜잭션이 동작하지 않을 수 있음
- 해결 방법: self-invocation 방지, 별도 서비스로 분리

5. JPA와 트랜잭션
- `EntityManager`는 트랜잭션이 시작될 때 영속성 컨텍스트를 생성하고, 트랜잭션이 커밋될 때 변경 사항을 DB에 반영(Flush)
---
