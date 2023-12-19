> Docs coming soon!

# AtPI
Open-source APIs. 

### Python APIs
APIs from [index.py](https://github.com/AtlasL1/AtPI/blob/main/index.py) are built with [FastAPI](https://fastapi.tiangolo.com/), a web framework. <br><br>
Those APIs are yet ready to be used until I find a suitable host for them. At the moment, you can use the JSON APIs.

### JSON APIs
APIs from [/api](https://github.com/AtlasL1/AtPI/tree/main/api) are static JSON APIs under the endpoint URL `https://atlas.is-not-a.dev/atpi/{name}.json` or `https://atpi.proj.sbs/api/{name}.json`.

**Quick Example**:
```py
import requests
response = requests.get('https://atlas.is-not-a.dev/atpi/bioe.json')
data = response.json()
print(data['questions'].get('1'))
```
The above code is a quick usage of the [BioE API](https://atlas.is-not-a.dev/atpi/bioe.json).
1. I retrieved the data with the Python package [Requests](https://pypi.org/project/requests/).
2. Basic usage of Requests. If you want to learn more, do check out their [documentation](https://requests.readthedocs.io/).
3. In the fourth line, `'1'` refers to the question ID (the number of the question). 
   - Note: The question ID It is a string (`str`), and not an integer (`int`). 
