import requests
response = requests.get('https://atpi.proj.sbs/api/ru/oпределенияхимии.json')
data = response.json()
for search in data:
    if search["термин"] == "Изотоп":
        print(search['определение'])
