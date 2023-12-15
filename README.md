# AtPI
Open-source APIs. 

APIs from [/api](https://github.com/AtlasL1/AtPI/tree/main/api) are static JSON APIs under the endpoint URL `https://atlas.is-not-a.dev/atpi/{name}.json`.

**Quick Example**:
```py
import requests

json_url = 'https://atlas.is-not-a.dev/atpi/bioe.json'
try:
    response = requests.get(json_url)
    data = response.json()
    number = "1"
    question_text = data['questions'].get(number)
    if question_text:
        print(question_text)
    else:
        print(f"Question {number} not found.")
except Exception as e:
    print(f"Error fetching data: {e}")
```
In the above example, Question 1 from the [BioE API](https://atlas.is-not-a.dev/atpi/bioe.json)
