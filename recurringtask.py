class RecurringTask:

    def __init__(self, weekday, hour, minute, function, *args):
        self.weekday = weekday
        self.hour = hour
        self.minute = minute
        self.function = function
        self.args = args

    async def run(self):
        try:
            if len(self.args) == 0:
                await self.function()
            else:
                await self.function(self.args)
        except Exception:
            return

    def compare_time(self, weekday, hour, minute):
        """"Compare this RecurringTask object to another time e.

        :param Weekday weekday: The weekday to compare to
        :param int hour: The hour to compare to
        :param int minute: The minute to compare to
        :returns: 0 if equal, 1 if this object is later as the compare time, -1 otherwise
        :rtype: int
        """
        if self.weekday.value == weekday.value and self.hour == hour and self.minute == minute:
            return 0
        elif self.weekday.value > weekday.value or\
                (self.weekday.value == weekday.value and self.hour > hour) or\
                (self.weekday.value == weekday.value and self.hour == hour and self.minute > minute):
            return 1
        else:
            return -1
