from flask import Blueprint, request, jsonify, send_file
from .services.text_parser import TextParser
from .services.tts_service import TTSService
from .services.ai_assistant import AIAssistant
from .models.session import ReadingSession, Bookmark, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid
import logging
import os

logger = logging.getLogger(__name__)

main_bp = Blueprint('main', __name__)

# Initialize services and database
engine = create_engine('sqlite:///readit.db')
Session = sessionmaker(bind=engine)

text_parser = TextParser()
tts_service = TTSService()
ai_assistant = AIAssistant()

@main_bp.route('/upload', methods=['POST'])
def upload_document():
    """Upload and parse a document"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Parse document
        logger.info(f"Parsing document: {file.filename}")
        parsed_content = text_parser.parse_document(file)
        
        # Create new session
        db_session = Session()
        session_id = str(uuid.uuid4())
        
        reading_session = ReadingSession(
            id=session_id,
            document_name=file.filename,
            content=parsed_content['segments'][0],
            segments=parsed_content['segments'],
            current_segment=0,
            current_position=0
        )
        
        db_session.add(reading_session)
        db_session.commit()
        
        logger.info(f"Created new session: {session_id}")
        
        return jsonify({
            'session_id': session_id,
            'metadata': parsed_content['metadata'],
            'segments': parsed_content['segments'],
            'current_segment': 0
        })
    except Exception as e:
        logger.error(f"Error in upload_document: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@main_bp.route('/voices', methods=['GET'])
def get_voices():
    """Get available TTS voices"""
    try:
        logger.info("Fetching available voices")
        voices = tts_service.get_available_voices()
        return jsonify(voices)
    except Exception as e:
        logger.error(f"Error in get_voices: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@main_bp.route('/tts', methods=['POST'])
def text_to_speech():
    """Convert text to speech"""
    try:
        data = request.json
        text = data.get('text')
        voice_id = data.get('voice_id', 'en-US-JennyNeural')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400

        logger.info(f"Converting text to speech using voice: {voice_id}")
        audio_path = tts_service.convert_to_speech(text, voice_id)
        
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Generated audio file not found: {audio_path}")
            
        logger.info(f"Sending audio file: {audio_path}")
        return send_file(
            audio_path,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='speech.wav',
            conditional=True
        )
    except FileNotFoundError as e:
        logger.error(f"Error in text_to_speech: {str(e)}", exc_info=True)
        return jsonify({'error': 'Audio file not found'}), 404
    except Exception as e:
        logger.error(f"Error in text_to_speech: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@main_bp.route('/session/<session_id>', methods=['GET', 'PUT'])
def manage_session(session_id):
    """Manage reading session"""
    try:
        db_session = Session()
        session = db_session.query(ReadingSession).filter_by(id=session_id).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404

        if request.method == 'GET':
            return jsonify(session.to_dict())
        
        # Update session
        data = request.json
        for key, value in data.items():
            if hasattr(session, key):
                setattr(session, key, value)
        
        db_session.commit()
        logger.info(f"Updated session: {session_id}")
        return jsonify(session.to_dict())
    except Exception as e:
        logger.error(f"Error in manage_session: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@main_bp.route('/session/<session_id>/bookmark', methods=['POST', 'GET', 'DELETE'])
def manage_bookmarks(session_id):
    """Manage bookmarks for a session"""
    try:
        db_session = Session()
        session = db_session.query(ReadingSession).filter_by(id=session_id).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
            
        if request.method == 'GET':
            bookmarks = [b.to_dict() for b in session.bookmarks]
            return jsonify(bookmarks)
            
        elif request.method == 'POST':
            data = request.json
            bookmark = Bookmark(
                session_id=session_id,
                segment_index=data.get('segment_index'),
                position=data.get('position'),
                note=data.get('note', '')
            )
            db_session.add(bookmark)
            db_session.commit()
            return jsonify(bookmark.to_dict())
            
        elif request.method == 'DELETE':
            bookmark_id = request.args.get('bookmark_id')
            bookmark = db_session.query(Bookmark).filter_by(id=bookmark_id).first()
            if bookmark:
                db_session.delete(bookmark)
                db_session.commit()
                return jsonify({'status': 'success'})
            return jsonify({'error': 'Bookmark not found'}), 404
            
    except Exception as e:
        logger.error(f"Error in manage_bookmarks: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@main_bp.route('/ask', methods=['POST'])
def ask_question():
    """Ask AI assistant a question about the current text"""
    try:
        data = request.json
        session_id = data.get('session_id')
        question = data.get('question')
        context = data.get('context')
        
        if not all([session_id, question, context]):
            return jsonify({'error': 'Missing required fields'}), 400
            
        logger.info(f"Processing question for session {session_id}")
        response = ai_assistant.ask_question(question, context)
        
        return jsonify({
            'response': response
        })
        
    except Exception as e:
        logger.error(f"Error in ask_question: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
