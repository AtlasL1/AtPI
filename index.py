from fastapi import FastAPI

app = FastAPI()

# WELCOME
@app.get('/', tags=['Root'])
def read_root():
    return {'message': 'Welcome to AtPI!'}

# BIOE
questions = {
    1: "Stem cells are important for living organisms because they are cells which will undergo cell division and cell differentiation to form tissues and organs such as the heart, lungs and skin.\n"
       "Embryonic stem cells are widely used in stem cell research for medical purposes. \n"
       "Discuss how stem cell research is beneficial to human health.",
    2: "Explain the importance of cellulose to herbaceous plants.",
    3: "State the function of smooth muscle tissue.",
    4: "Herbicide is often used to control the population of weeds in a garden by destroying the ATPase enzymes in the cells of the weeds.\n"
       "One of the effects of the herbicide is inhibiting the intake of minerals by the plants.\n"
       "Explain how the herbicide can inhibit the transport of minerals in the weed plants.",
    5: "Chillies are usually used as a decoration in cooking. Chillies will be cut longitudinally into a few parts. \n"
       "After removing the seeds inside, the chillies cut are soaked in water for 20 to 30 minutes. \n"
       "The results are shown in the diagram on the right. \n"
       "Why should the chillies be soaked in water?",
    6: "Why will excessive fertilisers cause a plant to wilt?",
    7: "Why are apples that have been boiled after they are peeled, do not change colour to brown?",
    8: "Why does cyanide poisoning cause immediate death?",
    9: "If you are a food entrepreneur, suggest an enzyme that you can use to process meat and fish. \n"
       "State the function of this enzyme.",
    10: "The enzymes that exist in the bacteria strain which live in hot spring areas can be extracted and added to laundry detergent. \n"
        "Suggest why enzymes from these bacteria are suitable to be used as laundry detergent.",
    11: "What are the uses of alcohol fermentation products?",
    12: "Why do muscles carry out cellular respiration that produces lactic acid during vigorous training?",
    13: "Explain why an individual usually feels tired faster compared with an athlete, when both of them are running together.",
}

def get_correct_answer(question_id):
    answers = {
        1: "Stem-cell research is a research that is carried out on stem cells for use in medicine. \n"
           "The research is important in treating diseases. \n"
           "The stem cells can be used in treating blood cancer such as leukemia and replacing damaged tissues and organs. \n"
           "For example, the production of nerve tissues to treat Alzheimer's and Parkinson's disease and producing new heart muscles to treat heart problems.",
        2: "Cellulose controls the water content of the cells to enable the cells to always to be turgid. \n"
           "This gives support to the herbaceous plants.",
        3: "The smooth muscle tissue contracts and relaxes to allow peristalsis to occur in the digestive tract.",
        4: "Herbicide destroys the ATPase enzymes in the cell. \n"
           "The ATPase enzymes are important in catalysing the hydrolysis of ATP into ADP and non-organic phosphate.\n"
           "Without the enzyme, active transport cannot occur as there is no phosphate ion to bind with the binding site of the carrier protein to allow it to change its shape and assist the movement of mineral salts into the cells of the weed plants.",
        5: "Water is hypotonic towards the cells of the inner part of the chillies. \n"
           "Water molecules diffuse into the inner part by osmosis.\n"
           "The outer part of the chillies has waxy layer which does not allow water to diffuse into the cells.\n"
           "Cells in the inner part become turgid and causes the chillies to bend outward. ",
        6: "Excessive fertilisers cause the ground water to be hypertonic to hair cells. \n"
           "Water molecules diffuse out of the root hair cells by osmosis which causes the cells to be plasmolysed.",
        7: "Apples contain a type of enzyme that transforms the colour of apple tissue to brown after it is peeled and left for a while. \n"
           "If the apple is boiled, the enzyme becomes denatured causing the apple to not turn brown.",
        8: "Cyanide can bind with one of the cellular respiration enzymes. \n"
           "Cyanide can block glucose oxidation and stop cellular respiration. \n"
           "Without cellular respiration, a person will die.",
        9: "The enzyme that is used in meat processing is protease. \n"
           "Protease helps to tenderise meat. \n"
           "The enzyme that is used in fish processing is protease. \n"
           "Proteases can separate fish meat from its skin.",
        10: "The washing machine has a temperature control function. \n"
            "High temperatures can cause the enzymes in detergents to denature. \n"
            "Thus, if enzymes are extracted from live bacteria in hot springs, these enzymes are able to withstand high temperatures without denaturing.",
        11: "Ethanol is used in the production of beer and wine. \n"
            "Carbon dioxide is used in bread-making to help the dough rise.",
        12: "To provide the energy needed as well as enabling an individual to carry out activities.",
        13: "An athlete usually has more mitochondria in the muscle cells. \n"
            "Increased uptake of oxygen and oxidation of lactic acid reduces muscle fatigue.",
    }

    return answers.get(question_id, "Unknown")

@app.get("/quiz/{question_id}")
def get_question(question_id: int):
    question_text = questions.get(question_id)
    if not question_text:
        raise HTTPException(status_code=404, detail="Question not found.")
    return {"question_id": question_id, "question_text": question_text}

@app.get("/quiz/answer/{question_id}")
def get_answer(question_id: int):
    correct_answer = get_correct_answer(question_id)
    if correct_answer == "Unknown":
        raise HTTPException(status_code=404, detail="Answer not found.")
    return {"question_id": question_id, "correct_answer": correct_answer}
