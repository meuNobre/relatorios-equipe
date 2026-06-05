from PIL import Image, ImageFont, ImageText
import config
from services.badge_service import BadgeService
from utils.date import get_date_joined_text
from utils.fonts import Fonts
from services.head_service import HeadService
from utils.text import center_text_x, wrap_text 


class SidebarRenderer:

  def __init__(
        self,
        canvas,
        draw,
  ):

        self.canvas = canvas
        self.draw = draw
        self.service = BadgeService()
  
  def render(self, member):
      self.draw_background()
      self.draw_head(member)
      self.draw_medal(member)

      badge = self.service.get_badge(member)
      self.draw_medal_text(badge.title, "white")
      self.draw_medal_subtitle_text(badge.subtitle)
      self.draw_date_joined_text(member.date_joined)
  
  def draw_background(self):
    self.draw.rectangle((0,0, config.SIDEBAR_WIDTH, config.IMAGE_HEIGHT), fill="#5169fa")

  def draw_head(self, member):
    head = HeadService.get_head(member.nickname)
    self.canvas.paste(head, (0,0))

  def draw_medal(self, member):
    
    badge = self.service.get_badge(member)

    #Convertendo em RGBA para conseguir colar na imagem original, que e RGB.
    medal = (
      Image.open(badge.medal_path)
      .convert("RGBA")
      .resize((config.MEDAL_WIDTH,config.MEDAL_HEIGHT)))
    
    #Terceiro argumento é a máscara de transparência.
    self.canvas.paste(medal,
                      (0,438),
                      medal)
    
  def draw_medal_text(self, text_content, color):
    text = ImageText.Text(
      text_content, 
      Fonts.FONT_MEDAL
      )
    
    TEXT_X = center_text_x(text, config.SIDEBAR_WIDTH)

    TEXT_Y = config.MEDAL_Y + config.MEDAL_HEIGHT

    self.draw.text((TEXT_X, TEXT_Y), text, color)

  def draw_medal_subtitle_text(self, text_content):

    lines = wrap_text(text_content, Fonts.SUBTITLE_FONT, config.SUBTITLE_MAX_WIDTH)

    SUBTITLE_Y = config.MEDAL_Y + config.MEDAL_HEIGHT + config.TEXT_PADDING + 80

    for line in lines:
      text = ImageText.Text(
        line,
        Fonts.SUBTITLE_FONT
      )

      TEXT_X = center_text_x(text, config.SIDEBAR_WIDTH)

      self.draw.text((TEXT_X, SUBTITLE_Y), text, "white")

      bbox = Fonts.SUBTITLE_FONT.getbbox(line)
      text_height = bbox[3] - bbox[1]

      SUBTITLE_Y += text_height + config.SUBTITLE_LINE_SPACING


  def draw_date_joined_text(self, date_joined):
    text_content = get_date_joined_text(date_joined)

    wrapped_lines = wrap_text(text_content, Fonts.FONT_DATE, 300)

    TEXT_Y = 1010

    for line in wrapped_lines:
      text = ImageText.Text(
          line,
          Fonts.FONT_DATE
        )

      TEXT_X = center_text_x(text, config.SIDEBAR_WIDTH)
      self.draw.text((TEXT_X, TEXT_Y), text, "white")

      bbox = Fonts.FONT_DATE.getbbox(line)
      text_height = bbox[3] - bbox[1]
      TEXT_Y += text_height + 5
  def draw_badge(self, badge, member):
    self.draw_medal(badge)
    self.draw_medal_text(badge["title"], "white")
    self.draw_medal_subtitle_text(badge["subtitle"])
    self.draw_date_joined_text(member.date_joined)