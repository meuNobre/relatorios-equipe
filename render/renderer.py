from PIL import Image, ImageDraw

import config

from utils.fonts import Fonts

from render.sidebar_renderer import SidebarRenderer
from render.content_renderer import ContentRenderer
from render.feedback_renderer import FeedbackRenderer


class ProfileRenderer:

    def __init__(self, member, feedbacks):

        self.member = member
        self.feedbacks = feedbacks

        self.canvas = Image.new(
            "RGB",
            config.RELATORIO_SIZE,
            config.RELATORIO_COLOR
        )

        self.draw = ImageDraw.Draw(
            self.canvas
        )

    def render(self):

        sidebar = SidebarRenderer(
            self.canvas,
            self.draw,
        )

        content = ContentRenderer(
            self.draw,
            self.member,
            Fonts
        )

        feedback = FeedbackRenderer(
            self.draw,
            self.member,
            self.feedbacks
        )

        sidebar.render(self.member)

        content.render()

        feedback.render()

        return self.canvas