from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "마이데이터용 서버입니다."}
