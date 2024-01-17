import requests
response = requests.get('https://atpi.proj.sbs/api/programming-langs.json')
data = response.json()
for lang in data:
    if lang["name"] == "Python":
        print(lang['paradigm'], lang['designer'], lang['releaseYear'])
