import requests
response = requests.get('https://atpi.proj.sbs/api/space-facts.json')
data = response.json()
print(data['facts'].get('1'))
