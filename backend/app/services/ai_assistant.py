import os
from openai import OpenAI
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class AIAssistant:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            error_msg = "OpenAI API Key not found in environment variables"
            logger.error(error_msg)
            raise ValueError(error_msg)
            
        self.client = OpenAI(api_key=self.api_key)
        
    def ask_question(self, question: str, context: str) -> str:
        """Ask a question about the given context"""
        try:
            logger.info(f"Processing question: {question}")
            
            # Create prompt with context
            prompt = f"""
            Context: {context}
            
            Question: {question}
            
            Please provide a clear and concise answer based on the context above.
            """
            
            # Get response from OpenAI
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that answers questions about text documents."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7,
            )
            
            answer = response.choices[0].message.content.strip()
            logger.info(f"Generated answer: {answer}")
            
            return answer
            
        except Exception as e:
            error_msg = f"Error getting AI response: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return "Sorry, I encountered an error. Please try again."
