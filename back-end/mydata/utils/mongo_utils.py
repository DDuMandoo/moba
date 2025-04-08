from bson import ObjectId

def convert_mongo_document(doc):
    if isinstance(doc, dict):
        return {k: str(v) if isinstance(v, ObjectId) else v for k, v in doc.items()}
    return doc
