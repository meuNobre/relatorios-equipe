from PIL import Image
import requests
from io import BytesIO

class HeadService:
  def __init__(self):
    pass

  @staticmethod
  def get_head(nickname: str):
    api_url = f"https://mc-heads.net/avatar/{nickname}/200"
    response = requests.get(api_url)
    if(response.status_code != 200):
      raise Exception("Erro ao buscar head da skin")
    else:
      return (Image.open(BytesIO(response.content))
              .convert("RGB")
              .resize((420,420))
      )