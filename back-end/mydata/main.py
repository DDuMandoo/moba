from fastapi import FastAPI
from mydata.api.mydata_router import router as recommend_router

app = FastAPI()
app.include_router(recommend_router, prefix="/api/mydata")
