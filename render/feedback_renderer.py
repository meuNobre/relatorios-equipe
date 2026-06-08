from PIL import ImageDraw, ImageFont
from utils.fonts import Fonts
from utils.text import center_text_x, wrap_text
from config import FEEDBACK_COLORS


class FeedbackRenderer:


    def __init__(self, draw, member, feedbacks):
        self.draw = draw
        self.member = member
        self.feedbacks = feedbacks

        self.start_x = 475
        self.start_y = 425

        self.current_y = self.start_y

    def draw_title(self):

        self.draw.text(
            (469, 360),
            "Este é o seu Desempenho do mês:",
            "black",
            Fonts.FONT_TITLES_CONTENT
        )

        self.draw.line(
            (469, 435, 469, 474),
            fill="black",
            width=6
        )

        self.draw.text(
            (480, 430),
            "Notas de Desempenho:",
            "black",
            Fonts.FONT_TITLES_CONTENT
        )

    def draw_description(self):

        description = (
            "Confira como ficou sua classificação de desempenho "
            "dentro de cada área de atuação e suas respectivas notas:"
        )

        wrapped_lines = wrap_text(
            description,
            Fonts.ITEM_FONT,
            750
        )

        self.current_y += 55

        for line in wrapped_lines:

            self.draw.text(
                (self.start_x, self.current_y),
                line,
                "black",
                Fonts.ITEM_FONT
            )

            bbox = Fonts.ITEM_FONT.getbbox(line)

            text_height = bbox[3] - bbox[1]

            self.current_y += text_height + 8

        self.current_y += 25

    def draw_department(self, department):

        self.draw.text(
            (self.start_x, self.current_y),
            f"• {department}",
            "black",
            Fonts.FEEDBACK_FONT
        )

        self.current_y += 55

    def draw_note(self, category, note):

        category_x = self.start_x + 40

        category_text = f"• {category}: "

        self.draw.text(
            (category_x, self.current_y),
            category_text,
            "black",
            Fonts.FEEDBACK_FONT
        )

        bbox = Fonts.FEEDBACK_FONT.getbbox(category_text)

        category_width = bbox[2] - bbox[0]

        note_x = category_x + category_width

        color = FEEDBACK_COLORS.get(
            note.lower(),
            "black"
        )

        self.draw.text(
            (note_x, self.current_y),
            note,
            color,
            Fonts.FEEDBACK_FONT
        )

        self.current_y += 40

    def draw_feedbacks(self):

        for feedback in self.feedbacks:

            self.draw_department(feedback.department)

            for category, note in feedback.notes.items():

                self.draw_note(category, note)

            self.current_y += 20

    def render(self):

        self.draw_title()

        self.draw_description()

        self.draw_feedbacks()