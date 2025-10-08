import os
import random
import datetime
import piexif
import io
import re
import tempfile
import shutil
from PIL import Image

# --- NEW: Google Drive API imports for Service Account ---
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseDownload

# This library is required for HEIC support. It plugs into Pillow.
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIC_SUPPORT = True
except ImportError:
    HEIC_SUPPORT = False

# --- NEW: Updated Configuration ---
# IMPORTANT: Update this with the exact name of your downloaded key file.
SERVICE_ACCOUNT_FILE = 'spoofer-474511-6019eb5803d6.json' # <-- UPDATE THIS FILENAME
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# List of Google Drive folder URLs you want to process
GDRIVE_FOLDER_URLS = [
    "https://drive.google.com/drive/folders/1NXatEL4JVxSsKBSRnq926iR6LZ6huTbD?usp=drive_link"
    # Add more Google Drive folder URLs here as needed
]

# --- Core Spoofing Functions (Unchanged) ---

def _generate_random_date(start_year=2015, end_year=2023):
    """Generates a random datetime object and formats it for EXIF data."""
    year = random.randint(start_year, end_year)
    month = random.randint(1, 12)
    day = random.randint(1, 28) # Keep day simple
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    random_date = datetime.datetime(year, month, day, hour, minute, second)
    return random_date.strftime("%Y:%m:%d %H:%M:%S")

def _generate_random_gps():
    """Generates random GPS coordinates in EXIF format."""
    lat_deg = random.randint(0, 89)
    lat_min = random.randint(0, 59)
    lat_sec = random.randint(0, 59) * 100
    lat_ref = random.choice(['N', 'S'])
    lon_deg = random.randint(0, 179)
    lon_min = random.randint(0, 59)
    lon_sec = random.randint(0, 59) * 100
    lon_ref = random.choice(['E', 'W'])

    return {
        piexif.GPSIFD.GPSLatitudeRef: lat_ref.encode('utf-8'),
        piexif.GPSIFD.GPSLatitude: ((lat_deg, 1), (lat_min, 1), (lat_sec, 100)),
        piexif.GPSIFD.GPSLongitudeRef: lon_ref.encode('utf-8'),
        piexif.GPSIFD.GPSLongitude: ((lon_deg, 1), (lon_min, 1), (lon_sec, 100)),
    }

def process_and_spoof_image(src_path, output_base_dir, counter):
    """
    Opens a source image and saves four differently spoofed JPEG versions.
    """
    base_filename = os.path.basename(src_path)
    print(f"    Processing {base_filename} (Image #{counter})...")

    try:
        img = Image.open(src_path)
        img.load()
    except (IOError, SyntaxError, ValueError) as e:
        print(f"      -> [ERROR] Skipping corrupt or invalid image file: {base_filename} ({e})")
        return False

    # --- Spoof A: Random Date & GPS ---
    try:
        dest_a_path = os.path.join(output_base_dir, "Spoofed_A", f"SpoofA_{counter}.jpg")
        exif_dict_a = {"GPS": _generate_random_gps()}
        random_date_a = _generate_random_date()
        exif_dict_a['Exif'] = {piexif.ExifIFD.DateTimeOriginal: random_date_a.encode('utf-8')}
        exif_dict_a['0th'] = {piexif.ImageIFD.DateTime: random_date_a.encode('utf-8')}
        exif_bytes_a = piexif.dump(exif_dict_a)
        img.save(dest_a_path, "jpeg", exif=exif_bytes_a)
    except Exception as e:
        print(f"      -> [ERROR] Failed to create Spoof A for {base_filename}: {e}")

    # --- Spoof B: Different Random Date & Fake Camera Info ---
    try:
        dest_b_path = os.path.join(output_base_dir, "Spoofed_B", f"SpoofB_{counter}.jpg")
        random_date_b = _generate_random_date(start_year=2010, end_year=2014)
        exif_dict_b = {
            '0th': {
                piexif.ImageIFD.DateTime: random_date_b.encode('utf-8'),
                piexif.ImageIFD.Make: random.choice([b"Fujifilm", b"Sony", b"Canon", b"Nikon"]),
                piexif.ImageIFD.Model: random.choice([b"Super-Camera 1000", b"Digital Pro X"]),
            },
            'Exif': {
                piexif.ExifIFD.DateTimeOriginal: random_date_b.encode('utf-8')
            }
        }
        exif_bytes_b = piexif.dump(exif_dict_b)
        img.save(dest_b_path, "jpeg", exif=exif_bytes_b)
    except Exception as e:
        print(f"      -> [ERROR] Failed to create Spoof B for {base_filename}: {e}")

    # --- Spoof C: Strip All EXIF Data ---
    try:
        dest_c_path = os.path.join(output_base_dir, "Spoofed_C", f"SpoofC_{counter}.jpg")
        img.save(dest_c_path, "jpeg")
    except Exception as e:
        print(f"      -> [ERROR] Failed to create Spoof C for {base_filename}: {e}")

    # --- Spoof D: Random Date, GPS, and Camera Info Combined ---
    try:
        dest_d_path = os.path.join(output_base_dir, "Spoofed_D", f"SpoofD_{counter}.jpg")
        random_date_d = _generate_random_date(start_year=2018, end_year=2024)
        exif_dict_d = {
            'GPS': _generate_random_gps(),
            '0th': {
                piexif.ImageIFD.DateTime: random_date_d.encode('utf-8'),
                piexif.ImageIFD.Make: random.choice([b"Apple", b"Samsung", b"Google", b"OnePlus"]),
                piexif.ImageIFD.Model: random.choice([b"iPhone 12 Pro", b"Galaxy S21", b"Pixel 6", b"OnePlus 9"]),
                piexif.ImageIFD.Software: random.choice([b"Adobe Photoshop 2023", b"GIMP 2.10", b"Camera+ 2"]),
            },
            'Exif': {
                piexif.ExifIFD.DateTimeOriginal: random_date_d.encode('utf-8'),
                piexif.ExifIFD.ExposureTime: (1, random.choice([60, 125, 250, 500])),
                piexif.ExifIFD.FNumber: (random.choice([14, 18, 22, 28]), 10),
                piexif.ExifIFD.ISOSpeedRatings: random.choice([100, 200, 400, 800, 1600]),
            }
        }
        exif_bytes_d = piexif.dump(exif_dict_d)
        img.save(dest_d_path, "jpeg", exif=exif_bytes_d)
    except Exception as e:
        print(f"      -> [ERROR] Failed to create Spoof D for {base_filename}: {e}")

    return True

# --- NEW: Simplified Google Drive Functions ---

def get_gdrive_service():
    """Authenticates using a service account and returns a service object."""
    try:
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        return build("drive", "v3", credentials=creds)
    except FileNotFoundError:
        print(f"[FATAL ERROR] Service account key file not found at: {SERVICE_ACCOUNT_FILE}")
        print("Please make sure the filename is correct and it's in the right folder.")
        return None
    except Exception as e:
        print(f"[FATAL ERROR] Could not load credentials from service account file: {e}")
        return None

def get_id_from_url(url):
    """Extracts the Google Drive folder ID from its URL."""
    match = re.search(r"/folders/([a-zA-Z0-9_-]+)", url)
    if match:
        return match.group(1)
    return None

def download_images_from_gdrive(service, folder_id, download_path):
    """Downloads all images from a Google Drive folder to a local directory."""
    try:
        folder_info = service.files().get(fileId=folder_id, fields='name').execute()
        folder_name = folder_info.get('name', 'Unknown Folder')
        print(f"\n=== Processing GDrive folder: '{folder_name}' ===")

        query = f"'{folder_id}' in parents and (mimeType contains 'image/')"
        results = service.files().list(q=query, pageSize=1000, fields="files(id, name)").execute()
        items = results.get("files", [])

        if not items:
            print(f"  No images found in folder '{folder_name}'.")
            return 0

        print(f"  Found {len(items)} images. Starting download...")
        os.makedirs(download_path, exist_ok=True)
        
        for item in items:
            file_id = item["id"]
            file_name = item["name"]
            print(f"    Downloading {file_name}...")
            request = service.files().get_media(fileId=file_id)
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()
            with open(os.path.join(download_path, file_name), "wb") as f:
                f.write(fh.getvalue())
        
        return len(items)

    except HttpError as error:
        print(f"  [ERROR] An API error occurred: {error}")
        if "File not found" in str(error):
            print("  -> Please check the folder ID and ensure it has been shared with the service account.")
        return 0

# --- Main Logic ---

def main():
    """Main function to process all specified Google Drive folders."""
    print("=== Starting Google Drive Image Spoofer (Service Account Mode) ===")
    
    service = get_gdrive_service()
    if not service:
        return # Exit if authentication failed

    total_processed = 0
    successful_folders = 0
    
    for url in GDRIVE_FOLDER_URLS:
        folder_id = get_id_from_url(url)
        if not folder_id:
            print(f"\nWarning: Invalid Google Drive URL skipped: {url}")
            continue

        temp_dir = tempfile.mkdtemp()
        try:
            download_count = download_images_from_gdrive(service, folder_id, temp_dir)
            if download_count == 0:
                continue

            safe_folder_name = f"gdrive_{folder_id[:10]}"
            output_dir = f"spoofed_{safe_folder_name}"
            
            output_folders = ["Spoofed_A", "Spoofed_B", "Spoofed_C", "Spoofed_D"]
            for folder in output_folders:
                os.makedirs(os.path.join(output_dir, folder), exist_ok=True)
            
            print(f"  Spoofing {download_count} downloaded images...")
            image_counter = 0
            for filename in os.listdir(temp_dir):
                source_image_path = os.path.join(temp_dir, filename)
                if process_and_spoof_image(source_image_path, output_dir, image_counter + 1):
                    image_counter += 1
            
            if image_counter > 0:
                successful_folders += 1
                total_processed += image_counter
                print(f"  Completed processing GDrive folder: {image_counter} images spoofed.")
        finally:
            shutil.rmtree(temp_dir)

    print(f"\n=== Processing Complete ===")
    print(f"Successfully processed {successful_folders} Google Drive folders.")
    print(f"Total images processed: {total_processed}")

if __name__ == "__main__":
    main()