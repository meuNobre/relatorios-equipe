from datetime import datetime 

class Member:
  def __init__(
      self,
      nickname,
      role,
      date_joined,
      departments,
      # feedbacks
  ):
    self.nickname = nickname
    self.role = role
    self.date_joined = date_joined
    self.departments = departments
    self.months = self.calculate_months()
    # self.feedbacks = feedbacks

  def calculate_months(self):
    date_joined = datetime.strptime(self.date_joined, "%Y-%m-%d")
    now = datetime.now()
    months = (now.year - date_joined.year) * 12 + now.month - date_joined.month
    
    return months
  
  def get_departments(self):
    return self.departments

  def get_badge(self,badges):
    badge = badges[0]

    for b in badges:
      if self.months >= b.min_months:
        badge = b
      else:
        break
    return badge

  def update_months(self):
    self.months = self.calculate_months()