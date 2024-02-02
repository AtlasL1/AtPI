import requests
response = requests.get('https://atpi.proj.sbs/partnered/imag/a3750-9.json')
data = response.json()
print(data[0]["name"], data[0]["rightAscension"], data[0]["declination"], data[0]["apparentMagnitude"], data[0]["evolutionaryStage"], data[0]["spectralType"], data[0]["radialVelocity"], data[0]["parallax"], data[0]["mass"], data[0]["radius"], data[0]["luminousity"], data[0]["surfaceGravity"], data[0]["temperature"])
