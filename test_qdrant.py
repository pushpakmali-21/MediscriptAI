from qdrant_client import QdrantClient
from qdrant_client.http import models

client = QdrantClient(":memory:")
client.create_collection("test", vectors_config=models.VectorParams(size=4, distance=models.Distance.COSINE))
client.upsert("test", points=[models.PointStruct(id=1, vector=[0.1, 0.2, 0.3, 0.4], payload={"text": "hello"})])
res = client.query_points("test", query=[0.1, 0.2, 0.3, 0.4], limit=1)
print(type(res))
print(type(res.points))
print(res.points[0].payload)
