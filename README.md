> Better site coming soon!

# AtPI.Proj.SBS
AtPI = Atlas + API <br>
Proj.SBS = Project + Side by Side 

### Python APIs
APIs from [index.py](https://github.com/AtlasL1/AtPI/blob/main/index.py) are built with [FastAPI](https://fastapi.tiangolo.com/), a web framework. <br><br>
Those APIs are yet ready to be used until I find a suitable host for them. At the moment, you can use the JSON APIs.

### JSON APIs
APIs from [/api](https://github.com/AtlasL1/AtPI/tree/main/api) are static JSON APIs under the endpoint URL `https://atlas.is-not-a.dev/atpi/{name}.json` or `https://atpi.proj.sbs/api/{name}.json`.

**Quick Example**:
```py
import requests
response = requests.get('https://atpi.proj.sbs/api/bioe.json')
data = response.json()
print(data['questions'].get('1'))
print(data['answers'].get('1'))
```
```
Stem cells are important for living organisms because they are cells which will undergo cell division and cell differentiation to form tissues and organs such as the heart, lungs and skin. Embryonic stem cells are widely used in stem cell research for medical purposes. Discuss how stem cell research is beneficial to human health.
Stem-cell research is a research that is carried out on stem cells for use in medicine. The research is important in treating diseases. The stem cells can be used in treating blood cancer such as leukemia and replacing damaged tissues and organs. For example, the production of nerve tissues to treat Alzheimer's and Parkinson's disease and producing new heart muscles to treat heart problems.
```
The above code is a quick usage of the [BioE API](https://atpi.proj.sbs/api/bioe.json).
1. In the first code block, I retrieved the data with the Python package [Requests](https://pypi.org/project/requests/).
2. Basic usage of Requests. If you want to learn more, do check out their [documentation](https://requests.readthedocs.io/).
3. In the fourth line, `'1'` refers to the question ID (the number of the question). 
   - Note: The question ID It is a string (`str`), and not an integer (`int`). 
4. The fifth line works the same as the fourth, except I used it to retrieve the answer of the first question instead. 
5. The second code block is the output in the terminal after running the code. 

> Domain from [proj.sbs](https://proj.sbs)