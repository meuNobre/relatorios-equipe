from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageText
import config
import utils.fonts as Fonts
from utils.text import center_text_x, wrap_text
    
class ContentRenderer:

    def __init__(self, draw, member, fonts):
        self.draw = draw
        self.member = member
        self.fonts = fonts

    def render(self):
        self.draw_nickname(self.member.nickname)
        self.draw_member_role(self.member)
        self.draw_department(self.member)
        self.draw_horizontal_line(240)
        self.draw_month()

    def draw_nickname(self, nickname):
        text = ImageText.Text(
            nickname,
            self.fonts.FONT_NICKNAME
        )
    
        TEXT_COORD = (469, 20)

        self.draw.text(TEXT_COORD, text, "black")

    def draw_member_role(self, member):
        role = member.role

        text = ImageText.Text(
            role,
            self.fonts.FONT_ROLE
        )

        TEXT_CORD = (469,140)

        self.draw.text(TEXT_CORD, text, "black")

    def draw_department(self, member):
        department = member.departments

        department_text = ", ".join(department)

        text_content = f"Departamento de {department_text}"

        text = ImageText.Text(
            text_content,
            self.fonts.FONT_DEPARTMENT
        )

        TEXT_COORD = (469, 180)

        self.draw.text(TEXT_COORD, text, "black")

    def draw_logo(self, canvas0):
        logo = (Image.open("assets/hylex_logo/logo.png")
                .convert("RGBA")
                .crop((0, 0, 325, 93.5))
        )
        canvas0.paste(logo, (1487, 49))

    def draw_horizontal_line(self, y):
        self.draw.line((469, y, config.IMAGE_WIDTH - 100, y), fill="black", width=4)

    def draw_month(self):
        date = datetime.now()
        month = date.strftime("%B")
        year = date.year
        text_content = f"{month}, {year}"

        text = ImageText.Text(
            text_content,
            self.fonts.FONT_DATENOW,
            "black"
        )

        TEXT_COORD = (469, 250)

        self.draw.text(TEXT_COORD, text, "black")
