# coding=utf8
import datetime
import urllib.request

from bs4 import BeautifulSoup


def get_food_plan(**kwargs):
    """
    Gets food plan for mensa / date from sw-ka.de

    Valid mensa names: adenauerring, moltke, erzenberger, gottesaue, tiefenbronner, holzgarten, cafeteria_moltkestraße

    :param kwargs: "mensa" key with valid mensa name and "date" key with date in isoformat (YYYY-MM-DD)
    :return: dict of canteen-lines with food and prices (in €)
    """
    canteens = {
        "adenauerring": 1,
        "moltke": 2,
        "erzenberger": 3,
        "gottesaue": 4,
        "tiefenbronner": 5,
        "holzgarten": 6,
        "cafeteria_moltkestraße": 7,
    }

    if kwargs.get("mensa") is None:
        mensa = "adenauerring"
    else:
        if kwargs.get("mensa") not in canteens.keys():
            raise KeyError("Given menas name not valid.")
        mensa = kwargs.get("mensa")

    if kwargs.get("date") is None:
        date = datetime.datetime.today()
    else:
        date = datetime.datetime.fromisoformat(kwargs.get("date"))
    weekday = date.isoweekday()
    # Mensa is not open on saturday and sunday, look for next mondays meals
    if weekday >= 6:
        date += datetime.timedelta(((1 - weekday) + 7) % 7)

    url = "https://www.sw-ka.de/de/essen/?d=" + date.date().isoformat()

    # get page for actual or next week
    page = urllib.request.urlopen(url)
    page_parsed = BeautifulSoup(page, "lxml")
    found = page_parsed.find('div', {"id": "fragment-c" + str(canteens[mensa]) + "-1"}).table.children

    foodplan = {}
    for row in found:
        linie = row.find("td", class_="mensatype").div.get_text("\n")
        angebot = row.find("td", class_="mensadata").find_all("tr")
        linie_angebote = []
        for essen in angebot:
            try:
                gericht = essen.find("td", class_="first").span.text
                preis = essen.find("span", class_="price_1").text
                linie_angebote.append((gericht, preis))
            except AttributeError:
                pass
        foodplan[linie] = linie_angebote
    return foodplan


if __name__ == "__main__":
    food = get_food_plan()
    print(food)
