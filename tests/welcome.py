import requests
response = requests.get('https://atpi.proj.sbs/api/welcome.json')
data = response.json()
print(data['message'])
