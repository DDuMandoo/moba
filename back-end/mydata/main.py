from fastapi import FastAPI
from mydata.api.mydata_router import router as recommend_router
from mydata.api.meeting_router import router as meeting_router

app = FastAPI()
app.include_router(recommend_router, prefix="/api/mydata")
app.include_router(meeting_router, prefix="/api/meeting")