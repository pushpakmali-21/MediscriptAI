import httpx
import io
from PIL import Image

img = Image.new('RGB', (100, 100), color = 'white')
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='JPEG')
image_bytes = img_byte_arr.getvalue()

files = {'file': ('test.jpg', image_bytes, 'image/jpeg')}
response = httpx.post("http://localhost:8000/api/v1/extract", files=files, timeout=30.0)

print(response.status_code)
print(response.text)
