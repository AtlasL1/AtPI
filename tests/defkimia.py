import requests
response = requests.get('https://atpi.proj.sbs/api/ms/defkimia.json')
data = response.json()
for search in data:
    if search["perkataan"] == "Isotop":
        print(search['definisi'])
