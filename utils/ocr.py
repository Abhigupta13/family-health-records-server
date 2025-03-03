import sys
import pytesseract
from PIL import Image

# Get image path from command line argument
image_path = sys.argv[1]

try:
    # Open the image
    img = Image.open(image_path)

    # Convert to grayscale and process with pytesseract
    text = pytesseract.image_to_string(img, config='--psm 6')

    # Print extracted text (Node.js will capture this output)
    print(text)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)  # Print error to stderr for better visibility
