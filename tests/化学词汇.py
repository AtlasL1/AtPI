import requests
response = requests.get('https://atpi.proj.sbs/api/zh/化学词汇.json')
data = response.json()
for search in data:
    if search["词"] == "同位素":
        print(search['定义'])
