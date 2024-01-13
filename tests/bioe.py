import requests
response = requests.get('https://atpi.proj.sbs/api/bioe.json')
data = response.json()
print(data['questions'].get('1'))
print(data['answers'].get('1'))
