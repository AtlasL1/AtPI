import requests
response = requests.get('https://atpi.proj.sbs/api/physde.json')
data = response.json()
for search in data:
    if search["term"] == "Inertia":
        print(search['definition'])