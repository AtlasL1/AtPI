import requests
response = requests.get('https://atpi.proj.sbs/api/world-capitals.json')
data = response.json()
for country in data:
    if country["name"] == "Japan":
        print(country['capital'], country['image'])