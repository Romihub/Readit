import os
import azure.cognitiveservices.speech as speechsdk
from datetime import datetime
import json
import hashlib
import logging

logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self):
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.service_region = os.getenv("AZURE_SPEECH_REGION", "eastus")
        # Use absolute path for audio cache
        self.output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'audio_cache'))
        self.voices = {
            'en-US-JennyNeural': 'Female, Neutral',
            'en-US-GuyNeural': 'Male, Neutral',
            'en-US-AriaNeural': 'Female, Professional',
            'en-US-DavisNeural': 'Male, Professional',
            'en-GB-SoniaNeural': 'Female, British',
            'en-GB-RyanNeural': 'Male, British'
        }
        
        # Create audio cache directory if it doesn't exist
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir, exist_ok=True)
            logger.info(f"Created audio cache directory: {self.output_dir}")
            
        if not self.speech_key:
            error_msg = "Azure Speech Key not found in environment variables"
            logger.error(error_msg)
            raise ValueError(error_msg)

    def get_available_voices(self):
        """Return list of available voices"""
        try:
            logger.info("Fetching available voices")
            return {id: desc for id, desc in self.voices.items()}
        except Exception as e:
            error_msg = f"Error getting voices: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise ValueError(error_msg)

    def convert_to_speech(self, text, voice_id='en-US-JennyNeural', cache=True):
        """Convert text to speech using Azure TTS"""
        try:
            logger.info(f"Converting text to speech using voice: {voice_id}")
            
            if voice_id not in self.voices:
                error_msg = f"Invalid voice ID: {voice_id}"
                logger.error(error_msg)
                raise ValueError(error_msg)

            # Generate cache key based on text and voice
            cache_key = self._generate_cache_key(text, voice_id)
            cache_path = os.path.join(self.output_dir, f"{cache_key}.wav")
            logger.info(f"Audio cache path: {cache_path}")

            # Check cache first
            if cache and os.path.exists(cache_path):
                logger.info(f"Using cached audio: {cache_path}")
                return cache_path

            # Create speech configuration
            speech_config = speechsdk.SpeechConfig(
                subscription=self.speech_key, 
                region=self.service_region
            )
            
            # Set speech synthesis voice
            speech_config.speech_synthesis_voice_name = voice_id
            
            # Create audio configuration with absolute path
            audio_config = speechsdk.audio.AudioOutputConfig(filename=cache_path)
            
            # Create speech synthesizer
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=speech_config, 
                audio_config=audio_config
            )

            # Start the synthesis
            result = synthesizer.speak_text_async(text).get()

            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                logger.info(f"Speech synthesis completed: {cache_path}")
                if not os.path.exists(cache_path):
                    raise FileNotFoundError(f"Audio file not found after synthesis: {cache_path}")
                return cache_path
            else:
                error_msg = f"Speech synthesis failed: {result.reason}"
                logger.error(error_msg)
                raise Exception(error_msg)

        except Exception as e:
            error_msg = f"Error in text-to-speech conversion: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise

    def _generate_cache_key(self, text, voice_id):
        """Generate a unique cache key for the text and voice combination"""
        data = f"{text}{voice_id}".encode('utf-8')
        return hashlib.md5(data).hexdigest()

    def prepare_offline_audio(self, segments, voice_id='en-US-JennyNeural'):
        """Prepare audio files for offline use"""
        try:
            audio_files = []
            for segment in segments:
                audio_path = self.convert_to_speech(segment, voice_id)
                audio_files.append(audio_path)
            return audio_files
        except Exception as e:
            error_msg = f"Error preparing offline audio: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise

    def cleanup_old_files(self, max_age_hours=24):
        """Clean up old audio files"""
        try:
            current_time = datetime.now()
            for filename in os.listdir(self.output_dir):
                file_path = os.path.join(self.output_dir, filename)
                file_age = datetime.fromtimestamp(os.path.getctime(file_path))
                age_hours = (current_time - file_age).total_seconds() / 3600
                
                if age_hours > max_age_hours:
                    os.remove(file_path)
                    logger.info(f"Removed old audio file: {file_path}")
        except Exception as e:
            error_msg = f"Error cleaning up old files: {str(e)}"
            logger.error(error_msg, exc_info=True)
            # Don't raise the error, just log it
            pass
