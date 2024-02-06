import requests
response = requests.get('https://atpi.proj.sbs/api/famous-artworks.json')
data = response.json()
for art in data:
    if art["name"] == "The Starry Night":
        print(art['artist'], art['year'], art['location'], art['notes'], art['image'])
