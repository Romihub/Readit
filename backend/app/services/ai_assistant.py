import os
import openai
from dotenv import load_dotenv
import logging
from typing import Optional

load_dotenv()
logger = logging.getLogger(__name__)

class AIAssistant:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            error_msg = "OpenAI API key not found in environment variables"
            logger.error(error_msg)
            raise ValueError(error_msg)
            
        # Set the API key directly
        openai.api_key = self.api_key
        self.model = "gpt-3.5-turbo"
        
    async def ask_question(self, question: str, context: str) -> str:
        """
        Ask a question about the document context
        """
        try:
            logger.info(f"Processing question: {question}")
            
            response = await openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that answers questions about documents."},
                    {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
                ]
            )
            answer = response.choices[0].message['content']
            logger.info(f"Generated answer: {answer}")
            
            return answer
            
        except Exception as e:
            error_msg = f"Error getting AI response: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return "Sorry, I encountered an error. Please try again."
