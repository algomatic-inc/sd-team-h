import os

import google.generativeai as genai


# configure google api
genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
model = genai.GenerativeModel('gemini-pro')

def get_model():
    return model
