import config


class BadgeService:
  def __init__(self):
    pass

  
  def get_badge(self, member):
    badge = config.BADGES[0]

    for b in config.BADGES:
      if member.months >= b.min_months:
        badge = b
      else:
        break
    return badge