import os
import base64
import tempfile
import requests
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from deepface import DeepFace
from pymongo import MongoClient
from flask_cors import CORS

# --- Setup logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('voter_verification.log')
    ]
)
logger = logging.getLogger(__name__)

# --- Configuration (use env variables) ---
MONGO_URI = os.environ.get("MONGODB_URI")
MONGO_DB = os.environ.get("MONGO_DB", "gdghackathon")
VOTERS_COLLECTION = os.environ.get("VOTERS_COLLECTION", "voters")
UPLOAD_TMP_DIR = os.environ.get("UPLOAD_TMP_DIR", "/tmp/voter_verification")
os.makedirs(UPLOAD_TMP_DIR, exist_ok=True)

app = Flask(__name__)
CORS(app)

# --- MongoDB client ---
logger.info(f"Connecting to MongoDB at {MONGO_URI}")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client[MONGO_DB]
voters_col = db[VOTERS_COLLECTION]
logger.info(f"Connected to database '{MONGO_DB}', collection '{VOTERS_COLLECTION}'")

# --- Face comparison function (unchanged matching math & models) ---
def compare_faces(image1_path, image2_path, threshold=0.4):
    """
    Compare two faces using DeepFace
    Returns: (matched: bool, similarity: float)
    """
    logger.info(f"Starting face comparison: {image1_path} vs {image2_path}")
    logger.info(f"Threshold set to: {threshold}")
    
    try:
        logger.info("Attempting face comparison with Facenet512 model...")
        result = DeepFace.verify(
            img1_path=image1_path,
            img2_path=image2_path,
            model_name='Facenet512',
            detector_backend='opencv',
            distance_metric='cosine',
            enforce_detection=False,
            align=True
        )
        
        distance = result.get('distance', 2.0)
        similarity = max(0, 1 - (distance / 2))
        matched = result.get('verified', False)
        
        logger.info(f"DeepFace Result - Distance: {distance:.4f}, Similarity: {similarity:.4f}, Matched: {matched}")
        logger.info(f"Comparison complete. Match: {matched}, Similarity: {similarity:.2%}")
        
        return matched, similarity
    except Exception as e:
        logger.error(f"Error comparing faces with Facenet512: {str(e)}")
        
        try:
            logger.info("Attempting fallback verification with VGG-Face model...")
            result = DeepFace.verify(
                img1_path=image1_path,
                img2_path=image2_path,
                model_name='VGG-Face',
                detector_backend='opencv',
                enforce_detection=False
            )
            distance = result.get('distance', 2.0)
            similarity = max(0, 1 - (distance / 2))
            matched = result.get('verified', False)
            
            logger.info(f"Fallback VGG-Face Result - Distance: {distance:.4f}, Similarity: {similarity:.4f}, Matched: {matched}")
            return matched, similarity
        except Exception as e2:
            logger.error(f"Fallback verification also failed: {str(e2)}")
            return False, 0.0

def save_base64_to_file(b64data, dest_path):
    """Save base64 encoded image to file"""
    logger.info(f"Saving base64 image to: {dest_path}")
    try:
        with open(dest_path, "wb") as f:
            f.write(base64.b64decode(b64data))
        file_size = os.path.getsize(dest_path)
        logger.info(f"Base64 image saved successfully. File size: {file_size} bytes")
    except Exception as e:
        logger.error(f"Error saving base64 to file {dest_path}: {str(e)}")
        raise

def download_url_to_file(url, dest_path):
    """Download image from URL to file"""
    logger.info(f"Downloading image from URL: {url}")
    logger.info(f"Saving to: {dest_path}")
    try:
        resp = requests.get(url, stream=True, timeout=10)
        resp.raise_for_status()
        
        total_size = 0
        with open(dest_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    total_size += len(chunk)
        
        logger.info(f"URL image downloaded successfully. File size: {total_size} bytes")
    except Exception as e:
        logger.error(f"Error downloading URL {url}: {str(e)}")
        raise

def get_registered_image_for_voter(voter_id):
    """
    Returns (path_to_file, name) or (None, None) if not found.
    Looks in voters collection for voterID == voter_id (string).
    """
    logger.info(f"Looking up registered image for voter ID: {voter_id}")
    
    try:
        doc = voters_col.find_one({"voterID": voter_id})
        if not doc:
            logger.warning(f"No document found for voter ID: {voter_id}")
            return None, None

        # Prefer localPath if present and file exists
        profile = doc.get("profilePicture") or {}
        local_path = profile.get("localPath")
        url = profile.get("url")
        name = doc.get("fullName") or doc.get("name") or voter_id
        
        logger.info(f"Found voter document. Name: {name}")
        logger.info(f"Profile data - localPath: {local_path}, URL present: {bool(url)}")

        # If localPath exists and file is accessible on server, use directly
        if local_path and os.path.exists(local_path):
            logger.info(f"Using local path: {local_path}")
            file_size = os.path.getsize(local_path)
            logger.info(f"Local file size: {file_size} bytes")
            return local_path, name

        # If url is present and is data:image base64, decode and save
        if url and url.startswith("data:image"):
            logger.info("Found data URL (base64 encoded image)")
            try:
                b64 = url.split(",", 1)[1]
                tmpf = os.path.join(UPLOAD_TMP_DIR, f"reg_{voter_id}.jpg")
                logger.info(f"Decoding data URL and saving to temp file: {tmpf}")
                save_base64_to_file(b64, tmpf)
                return tmpf, name
            except Exception as e:
                logger.error(f"Error decoding data URL: {str(e)}")

        # If url is http/https, download to temp file
        if url and (url.startswith("http://") or url.startswith("https://")):
            logger.info(f"Found HTTP URL: {url}")
            try:
                tmpf = os.path.join(UPLOAD_TMP_DIR, f"reg_{voter_id}.jpg")
                logger.info(f"Downloading from URL to temp file: {tmpf}")
                download_url_to_file(url, tmpf)
                return tmpf, name
            except Exception as e:
                logger.error(f"Error downloading URL: {str(e)}")

        # If none worked, return None
        logger.warning("No valid image source found for voter")
        return None, name
        
    except Exception as e:
        logger.error(f"Error in get_registered_image_for_voter for voter {voter_id}: {str(e)}")
        return None, None


@app.route('/verify', methods=['POST'])
def verify():
    logger.info("=" * 50)
    logger.info("STARTING VERIFICATION REQUEST")
    start_time = datetime.now()
    
    # Log request details
    logger.info(f"Request method: {request.method}")
    logger.info(f"Content-Type: {request.content_type}")
    logger.info(f"Content-Length: {request.content_length}")
    
    try:
        # Get the raw data first for debugging
        raw_data = request.get_data(as_text=True)
        logger.info(f"Raw data preview: {raw_data[:200] if raw_data else 'None'}")
        
        # Parse JSON
        data = request.get_json(force=True, silent=True)
        if data is None:
            logger.error("Failed to parse JSON data")
            # Try manual parsing
            if raw_data:
                try:
                    import json
                    data = json.loads(raw_data)
                    logger.info("Manually parsed JSON data")
                except Exception as e:
                    logger.error(f"Manual JSON parsing failed: {str(e)}")
                    return jsonify({
                        'verified': False, 
                        'message': f'Invalid JSON format: {str(e)}', 
                        'similarity': 0
                    })
            else:
                return jsonify({
                    'verified': False, 
                    'message': 'No data received', 
                    'similarity': 0
                })
        
        logger.info(f"Parsed JSON keys: {list(data.keys())}")
        
        # Extract data
        voter_id = data.get('voter_id')
        image_data = data.get('image')
        
        # Try alternative field names
        if not voter_id:
            voter_id = data.get('voterId') or data.get('voterID') or data.get('voter_id')
        if not image_data:
            image_data = data.get('faceImage') or data.get('photo') or data.get('capture')
        
        logger.info(f"Final extracted - Voter ID: {voter_id}")
        logger.info(f"Image data present: {bool(image_data)}")
        logger.info(f"Image data type: {type(image_data)}")
        if image_data:
            logger.info(f"Image data starts with: {image_data[:50]}...")
            logger.info(f"Image data is base64: {'data:image' in str(image_data[:20])}")
        
        if not voter_id:
            logger.error(f"No voter_id found. Available keys: {list(data.keys())}")
            return jsonify({
                'verified': False, 
                'message': f'Missing voter_id. Available keys: {list(data.keys())}', 
                'similarity': 0
            })
        
        if not image_data:
            logger.error(f"No image data found for voter_id: {voter_id}")
            return jsonify({
                'verified': False, 
                'message': 'Missing image data', 
                'similarity': 0
            })
        
        # Rest of your existing verification code...
        # Continue with Step 1: Fetch registered image from MongoDB...
        logger.info("Step 1: Fetching registered image...")
        reg_img_path, name = get_registered_image_for_voter(voter_id)
        
        if reg_img_path is None:
            logger.error(f"No registered image found for voter ID: {voter_id}")
            return jsonify({'verified': False, 'message': 'Voter ID not found or no registered image', 'similarity': 0})
        
        logger.info(f"Registered image path: {reg_img_path}")
        logger.info(f"Voter name: {name}")

        # Step 2: Save captured image temporarily
        logger.info("Step 2: Processing captured image...")
        tmp_capture = os.path.join(UPLOAD_TMP_DIR, f"capture_{voter_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg")
        
        try:
            if image_data.startswith('data:image'):
                logger.info("Image data is in data:image format")
                b64 = image_data.split(',', 1)[1]
            else:
                logger.info("Image data is plain base64")
                b64 = image_data
            
            logger.info(f"Saving captured image to: {tmp_capture}")
            save_base64_to_file(b64, tmp_capture)
            capture_size = os.path.getsize(tmp_capture)
            logger.info(f"Captured image saved. Size: {capture_size} bytes")
            
        except Exception as e:
            logger.error(f"Error saving captured image: {str(e)}")
            return jsonify({'verified': False, 'message': f'Error processing image: {str(e)}', 'similarity': 0})

        # Step 3: Compare faces
        logger.info("Step 3: Comparing faces...")
        logger.info("===== DEBUG IMAGES =====")
        logger.info(f"Registered image path: {reg_img_path}")
        logger.info(f"Registered image size: {os.path.getsize(reg_img_path)} bytes")
        logger.info(f"Captured image path: {tmp_capture}")
        logger.info(f"Captured image size: {os.path.getsize(tmp_capture)} bytes")
        logger.info("======================")
        
        matched, similarity = compare_faces(reg_img_path, tmp_capture, threshold=0.4)
        
        # Step 4: Cleanup temporary files
        logger.info("Step 4: Cleaning up temporary files...")
        try:
            if os.path.exists(tmp_capture):
                os.remove(tmp_capture)
                logger.info(f"Removed captured temp file: {tmp_capture}")
        except Exception as e:
            logger.warning(f"Could not remove temp file {tmp_capture}: {str(e)}")

        # Step 5: Prepare response
        elapsed_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Verification complete in {elapsed_time:.2f} seconds")
        logger.info(f"Result - Verified: {matched}, Similarity: {similarity:.2%}")
        
        response_data = {
            'verified': bool(matched),
            'name': name,
            'similarity': float(similarity),
            'message': 'Identity verified' if matched else 'Face does not match registered photo',
            'processing_time': elapsed_time
        }
        
        logger.info("Sending response to client")
        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Verification error: {str(e)}", exc_info=True)
        return jsonify({
            'verified': False, 
            'message': f'Error: {str(e)}', 
            'similarity': 0,
            'processing_time': (datetime.now() - start_time).total_seconds()
        })

@app.route('/register', methods=['POST'])
def register():
    logger.info("Registration endpoint called (disabled)")
    return jsonify({'success': False, 'message': 'Registration via python disabled; use MERN API.'}), 400

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    try:
        # Check MongoDB connection
        mongo_client.admin.command('ping')
        mongo_status = "connected"
    except Exception as e:
        mongo_status = f"error: {str(e)}"
    
    # Check temp directory
    temp_dir_status = "exists" if os.path.exists(UPLOAD_TMP_DIR) else "missing"
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'mongodb': mongo_status,
        'temp_directory': temp_dir_status,
        'temp_dir_path': UPLOAD_TMP_DIR
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Voter Verification Service on port {port}")
    logger.info(f"Configuration:")
    logger.info(f"  - MongoDB URI: {MONGO_URI}")
    logger.info(f"  - Database: {MONGO_DB}")
    logger.info(f"  - Collection: {VOTERS_COLLECTION}")
    logger.info(f"  - Temp Directory: {UPLOAD_TMP_DIR}")
    
    app.run(host="0.0.0.0", debug=True, port=port)