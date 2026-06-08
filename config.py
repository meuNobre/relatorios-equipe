from models.badge import Badge

# ------------------ IMAGE ------------------

IMAGE_WIDTH = 1920
IMAGE_HEIGHT = 1080

RELATORIO_SIZE = (1920, 1080)
RELATORIO_COLOR = "white"

# ------------------ SIDEBAR ------------------

SIDEBAR_WIDTH = 419
SIDEBAR_COLOR = "#5169fa"

# ------------------ MEDAL ------------------

MEDAL_WIDTH = 419
MEDAL_HEIGHT = 358
MEDAL_Y = 454

# ------------------ TEXT ------------------

TEXT_PADDING = 10

SUBTITLE_MAX_WIDTH = SIDEBAR_WIDTH - 40
SUBTITLE_LINE_SPACING = 10

# ------------------ FEEDBACK COLORS ------------------

FEEDBACK_COLORS = {
    'excelente': '#c27ba0',
    'bom': '#93c47d',
    'ótimo': '#6aa84f',
    'regular': '#ffd966',
    'ruim': '#e06666'
}

# ------------------ BADGES ------------------

BADGES = [

    Badge(
        min_months=0,
        title="MEMBRO",
        subtitle="Você ainda não atingiu 4 meses conosco, mas agradecemos sua presença!",
        medal_path="assets/medals/0m.png"
    ),

    Badge(
        min_months=4,
        title="4 MESES",
        subtitle="Seu tempo conosco atingiu a marca de 4 meses",
        medal_path="assets/medals/4m.png"
    ),

    Badge(
        min_months=6,
        title="6 MESES",
        subtitle="Seu tempo conosco atingiu a marca de 6 meses",
        medal_path="assets/medals/6m.png"
    ),

    Badge(
        min_months=8,
        title="8 MESES",
        subtitle="Seu tempo conosco atingiu a marca de 8 meses",
        medal_path="assets/medals/8m.webp"
    ),

    Badge(
        min_months=12,
        title="1 ANO",
        subtitle="Seu tempo conosco atingiu a marca de 1 ano",
        medal_path="assets/medals/1a.png"
    )
]