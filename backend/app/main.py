from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from .services.text_parser import TextParser
from .services.tts_service import TTSService
from .services.ai_assistant import AIAssistant
from .models.session import ReadingSession, Bookmark, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize services and database
engine = create_engine('sqlite:///readit.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

text_parser = TextParser()
tts_service = TTSService()
ai_assistant = AIAssistant()

@app.route('/api/upload', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Parse document
        parsed_content = text_parser.parse_document(file)
        
        # Create new session
        db_session = Session()
        session_id = str(uuid.uuid4())
        
        reading_session = ReadingSession(
            id=session_id,
            document_name=file.filename,
            content=parsed_content['segments'][0],  # Store first segment
            segments=parsed_content['segments'],
            current_segment=0,
            current_position=0
        )
        
        db_session.add(reading_session)
        db_session.commit()
        
        return jsonify({
            'session_id': session_id,
            'metadata': parsed_content['metadata'],
            'first_segment': parsed_content['segments'][0]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voices', methods=['GET'])
def get_voices():
    """Get available TTS voices"""
    voices = tts_service.get_available_voices()
    return jsonify(voices)

@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data.get('text')
    voice_id = data.get('voice_id', 'en-US-JennyNeural')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        audio_path = tts_service.convert_to_speech(text, voice_id)
        return send_file(audio_path, mimetype='audio/wav')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/session/<session_id>', methods=['GET', 'PUT'])
def manage_session(session_id):
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
    
    session.last_accessed = datetime.utcnow()
    db_session.commit()
    return jsonify(session.to_dict())

@app.route('/api/session/<session_id>/bookmark', methods=['POST', 'GET', 'DELETE'])
def manage_bookmarks(session_id):
    db_session = Session()
    
    if request.method == 'POST':
        data = request.json
        bookmark = Bookmark(
            id=str(uuid.uuid4()),
            session_id=session_id,
            position=data['position'],
            segment_index=data['segment_index'],
            note=data.get('note', '')
        )
        db_session.add(bookmark)
        db_session.commit()
        return jsonify(bookmark.to_dict())
    
    elif request.method == 'GET':
        bookmarks = db_session.query(Bookmark).filter_by(session_id=session_id).all()
        return jsonify([b.to_dict() for b in bookmarks])
    
    else:  # DELETE
        bookmark_id = request.args.get('bookmark_id')
        bookmark = db_session.query(Bookmark).filter_by(id=bookmark_id).first()
        if bookmark:
            db_session.delete(bookmark)
            db_session.commit()
        return jsonify({'status': 'success'})

@app.route('/api/session/<session_id>/offline', methods=['POST'])
def prepare_offline(session_id):
    """Prepare audio files for offline use"""
    db_session = Session()
    session = db_session.query(ReadingSession).filter_by(id=session_id).first()
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    try:
        audio_paths = tts_service.prepare_offline_audio(
            session.segments,
            session.voice_id
        )
        session.cached_audio_paths = audio_paths
        session.offline_mode = True
        db_session.commit()
        return jsonify({'status': 'success', 'cached_segments': len(audio_paths)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
