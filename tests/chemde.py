import requests
response = requests.get('https://atpi.proj.sbs/api/chemde.json')
data = response.json()
for search in data:
    if search["term"] == "Isotope":
        print(search['definition'])
