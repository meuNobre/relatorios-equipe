from datetime import datetime


def calculate_months(date_joined):

    date_joined = datetime.strptime(
        date_joined,
        "%Y-%m-%d"
    )

    now = datetime.now()

    months = (
        (now.year - date_joined.year) * 12
        + now.month
        - date_joined.month
    )

    return months


def get_date_joined_text(date_joined):

    date_joined = date_joined.split("-")

    return (
        f"Você foi integrado em: "
        f"{date_joined[2]}/"
        f"{date_joined[1]}/"
        f"{date_joined[0]}"
    )


def get_current_month_text():

    date = datetime.now()

    month = date.strftime("%B")
    year = date.year

    return f"{month}, {year}"