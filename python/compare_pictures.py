import cv2
import os
import listing_dao
import uuid
from skimage.metrics import structural_similarity as ssim
import cv2
""" 
def compare_images(img1, img2):
    # Initialize the ORB detector
    orb = cv2.ORB_create()

    # Detect key points and compute descriptors for both images
    kp1, des1 = orb.detectAndCompute(img1, None)
    kp2, des2 = orb.detectAndCompute(img2, None)

    # Check if descriptors are valid
    if des1 is None or des2 is None or des1.shape[1] != des2.shape[1]:
        print("Could not compute valid descriptors for one or both images.")
        return None

    # Initialize the BFMatcher (Brute Force Matcher)
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    # Match the descriptors
    matches = bf.match(des1, des2)

    # Sort the matches based on distance (lower is better)
    matches = sorted(matches, key=lambda x: x.distance)

    # The score is the average distance of the top matches (lower is better)
    score = sum(match.distance for match in matches[:50]) / 50

    return score """

""" def compare_images(img1, img2):
    # Convert the images to grayscale
    img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    # Resize images to match the smallest one
    h1, w1 = img1.shape[:2]
    h2, w2 = img2.shape[:2]
    if h1 * w1 < h2 * w2:
        img2 = cv2.resize(img2, (w1, h1))
    else:
        img1 = cv2.resize(img1, (w2, h2))

    # Compute SSIM between two images
    return ssim(img1, img2)  """

def compare_images(img1, img2, method=cv2.HISTCMP_CORREL):
    hist1 = cv2.calcHist([img1], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
    hist2 = cv2.calcHist([img2], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
    hist1 = cv2.normalize(hist1, hist1).flatten()
    hist2 = cv2.normalize(hist2, hist2).flatten()
    return cv2.compareHist(hist1, hist2, method) 

def get_image_paths(directory):
    directory = os.path.expanduser(directory)
    return [os.path.join(directory, filename) for filename in os.listdir(directory)]

# Load image filenames
ebay_images = get_image_paths('~/eBay')
mercari_images = get_image_paths('~/Mercari')

dao = listing_dao.listing_dao('randy','F1r3sidechat!','ec2-54-86-188-228.compute-1.amazonaws.com', 'listflow')

# Set comparison method and similarity threshold
comparison_method = cv2.HISTCMP_CORREL  # or another method if preferred
similarity_threshold = 0.9  # adjust based on testing and requirement

# Store matches
matches = []
match_found = False

dao.open_connection()

# Compare each image in ebay with each image in mercari
for ebay_image_path in ebay_images:
    ebay_filename = os.path.basename(ebay_image_path).removesuffix('.jpg').removesuffix('.png').removesuffix('.jpeg')
    print(f'Processing {ebay_filename}')
    
    if(dao.image_associated(ebay_filename)):
        print(f'Image already associated: {ebay_image_path}')
        os.remove(ebay_image_path)
        continue
    
    ebay_image = cv2.imread(ebay_image_path)
    
    
    if ebay_image is None:
        print(f'Error loading eBay image: {ebay_image_path}')
        continue
    
    for mercari_image_path in mercari_images:
        """if match_found:
            match_found = False
            break"""
        
        mercari_filename = os.path.basename(mercari_image_path).removesuffix('.jpg').removesuffix('.png').removesuffix('.jpeg')
        
        mercari_image = cv2.imread(mercari_image_path)
        if mercari_image is None:
            print(f'Error loading Mercari image: {mercari_image_path}')
            mercari_images.remove(mercari_image_path)
            continue
        
        similarity = compare_images(ebay_image, mercari_image)
        
        if similarity is None:
            continue
        
        prv_similarity = 0.9
        
        if similarity >= similarity_threshold and similarity > prv_similarity:  # if images are similar
            guid = str(uuid.uuid4())
            prv_similarity = similarity
            #dao.update_cross_post_id(ebay_filename, guid)
            #dao.update_cross_post_id(mercari_filename, guid)
            
            #matches.append((ebay_image_path, mercari_image_path))
            print(f'Match found: {ebay_image_path}, {mercari_image_path}')
            #mercari_images.remove(mercari_image_path)
            #match_found = True
            
            #break  # move on to next ebay image
        
    if not match_found:
        print(f'No match found for {ebay_image_path}')
        
dao.close_connection()
