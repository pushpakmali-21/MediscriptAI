import os
from abc import ABC, abstractmethod
from typing import Any

from sentence_transformers import SentenceTransformer


class VectorStore(ABC):
    @abstractmethod
    def ingest(self, chunks: list[dict[str, Any]]):
        """
        Ingest chunks into the vector store.
        Each chunk should have 'text', 'metadata', and optionally 'id'.
        """

    @abstractmethod
    def retrieve(self, query: str, filters: dict[str, Any] | None = None, top_k: int = 5) -> list[dict[str, Any]]:
        """
        Retrieve top_k chunks matching the query.
        Returns list of chunks with 'text', 'metadata', and 'score'.
        """

class FaissVectorStore(VectorStore):
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", store_path: str = "./faiss_store"):
        self.model = SentenceTransformer(model_name)
        self.store_path = store_path
        self.chunks = []
        self.index = None
        
        import faiss
        self.faiss = faiss
        
        # In a real app we'd load existing index from disk if present

    def ingest(self, chunks: list[dict[str, Any]]):
        if not chunks:
            return
            
        texts = [c["text"] for c in chunks]
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        
        if self.index is None:
            dim = embeddings.shape[1]
            self.index = self.faiss.IndexFlatIP(dim) # Inner product for cosine sim (if normalized)
            
        # Normalize for cosine similarity
        self.faiss.normalize_L2(embeddings)
        self.index.add(embeddings)
        self.chunks.extend(chunks)
        # Note: persisting to disk omitted for brevity

    def retrieve(self, query: str, filters: dict[str, Any] | None = None, top_k: int = 5) -> list[dict[str, Any]]:
        if self.index is None or self.index.ntotal == 0:
            return []
            
        query_emb = self.model.encode([query], convert_to_numpy=True)
        self.faiss.normalize_L2(query_emb)
        
        # Simple post-filtering since FAISS FlatIndex doesn't support pre-filtering natively
        # We will fetch more and then filter
        k_fetch = min(max(top_k * 5, 20), self.index.ntotal)
        scores, indices = self.index.search(query_emb, k_fetch)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            chunk = self.chunks[idx]
            
            # Apply filters
            match = True
            if filters:
                for k, v in filters.items():
                    # Handle generic_name specifically or matching strings
                    if k in chunk.get("metadata", {}):
                        chunk_val = str(chunk["metadata"][k]).lower()
                        if isinstance(v, str) and v.lower() not in chunk_val:
                            match = False
                            break
                    else:
                        match = False
                        break
                        
            if match:
                res = chunk.copy()
                res["score"] = float(score)
                results.append(res)
                if len(results) == top_k:
                    break
                    
        return results

class QdrantVectorStore(VectorStore):
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", url: str = "http://qdrant:6333"):
        try:
            from qdrant_client import QdrantClient
            from qdrant_client.http import models as qmodels
        except ImportError:
            raise RuntimeError("qdrant-client not installed")
            
        self.client = QdrantClient(url=url)
        self.qmodels = qmodels
        self.collection_name = "mediscript_corpus"
        self.model = SentenceTransformer(model_name)
        
        # Initialize collection if not exists
        try:
            self.client.get_collection(self.collection_name)
        except ValueError:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=self.qmodels.VectorParams(
                    size=self.model.get_sentence_embedding_dimension(), 
                    distance=self.qmodels.Distance.COSINE
                )
            )

    def ingest(self, chunks: list[dict[str, Any]]):
        if not chunks:
            return
            
        texts = [c["text"] for c in chunks]
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        
        points = []
        import uuid
        for i, chunk in enumerate(chunks):
            point_id = chunk.get("id") or str(uuid.uuid4())
            points.append(self.qmodels.PointStruct(
                id=point_id,
                vector=embeddings[i].tolist(),
                payload={"text": chunk["text"], "metadata": chunk.get("metadata", {})}
            ))
            
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def retrieve(self, query: str, filters: dict[str, Any] | None = None, top_k: int = 5) -> list[dict[str, Any]]:
        query_emb = self.model.encode(query, convert_to_numpy=True)
        
        qdrant_filters = None
        if filters:
            must_conditions = []
            for k, v in filters.items():
                must_conditions.append(
                    self.qmodels.FieldCondition(
                        key=f"metadata.{k}",
                        match=self.qmodels.MatchValue(value=v)
                    )
                )
            if must_conditions:
                qdrant_filters = self.qmodels.Filter(must=must_conditions)
                
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_emb.tolist(),
            query_filter=qdrant_filters,
            limit=top_k
        )
        
        formatted_results = []
        for hit in results:
            formatted_results.append({
                "text": hit.payload.get("text", ""),
                "metadata": hit.payload.get("metadata", {}),
                "score": hit.score
            })
            
        return formatted_results

def get_vector_store() -> VectorStore:
    store_type = os.environ.get("VECTOR_STORE", "faiss").lower()
    model = os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    if store_type == "qdrant":
        return QdrantVectorStore(model_name=model)
    return FaissVectorStore(model_name=model)
