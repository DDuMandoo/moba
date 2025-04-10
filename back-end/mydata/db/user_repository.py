from datetime import datetime
from mydata.db.mongo import user_collection

def get_user(user_id: int):
    return user_collection.find_one({"user_id": user_id})

def ensure_user_exists(user_id: int):
    if not get_user(user_id):
        user_collection.insert_one({
            "user_id": user_id,
            "last_updated": datetime.now()
        })

def update_last_updated(user_id: int):
    user_collection.update_one(
        {"user_id": user_id},
        {"$set": {"last_updated": datetime.now()}}
    )
