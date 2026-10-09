import os
from abc import ABC, abstractmethod
from typing import Any

import cv2
import numpy as np


class OCREngine(ABC):
    @abstractmethod
    def extract_text(self, image_bytes: bytes) -> tuple[list[dict[str, Any]], float]:
        """
        Extracts text from image bytes.
        Returns a tuple: (list of line objects, overall confidence).
        Line object format: {"text": str, "bbox": [[x,y], ...], "confidence": float}
        """

class EasyOCREngine(OCREngine):
    def __init__(self):
        import easyocr
        # Use English by default, run on CPU if GPU is not available
        self.reader = easyocr.Reader(['en'], gpu=False)

    def extract_text(self, image_bytes: bytes) -> tuple[list[dict[str, Any]], float]:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Read text
        # detail=1 gives bounding box, text, and confidence
        results = self.reader.readtext(img, detail=1)
        
        lines = []
        confidences = []
        for (bbox, text, prob) in results:
            lines.append({
                "text": text,
                # Convert numpy types to native Python types for JSON serialization
                "bbox": [[float(pt[0]), float(pt[1])] for pt in bbox],
                "confidence": float(prob)
            })
            confidences.append(float(prob))
            
        overall_conf = sum(confidences) / len(confidences) if confidences else 0.0
        return lines, overall_conf

class VisionAPIError(Exception):
    pass

class GoogleVisionEngine(OCREngine):
    def __init__(self):
        try:
            from google.cloud import vision
            self.client = vision.ImageAnnotatorClient()
        except ImportError:
            self.client = None

    def extract_text(self, image_bytes: bytes) -> tuple[list[dict[str, Any]], float]:
        if not self.client:
            raise RuntimeError("google-cloud-vision is not installed.")
        from google.cloud import vision
        
        image = vision.Image(content=image_bytes)
        response = self.client.document_text_detection(image=image)
        
        if response.error.message:
            raise VisionAPIError(f"Google Vision API Error: {response.error.message}")
            
        lines = []
        confidences = []
        
        for page in response.full_text_annotation.pages:
            for block in page.blocks:
                for paragraph in block.paragraphs:
                    # In Google Vision, paragraph is roughly a line/block of text
                    text = ""
                    for word in paragraph.words:
                        for symbol in word.symbols:
                            text += symbol.text
                        text += " "
                    text = text.strip()
                    
                    if text:
                        vertices = paragraph.bounding_box.vertices
                        bbox = [[v.x, v.y] for v in vertices]
                        prob = paragraph.confidence
                        
                        lines.append({
                            "text": text,
                            "bbox": bbox,
                            "confidence": prob
                        })
                        confidences.append(prob)
                        
        overall_conf = sum(confidences) / len(confidences) if confidences else 0.0
        return lines, overall_conf

def get_ocr_engine() -> OCREngine:
    engine_type = os.environ.get("OCR_ENGINE", "easyocr").lower()
    if engine_type == "google":
        return GoogleVisionEngine()
    return EasyOCREngine()
