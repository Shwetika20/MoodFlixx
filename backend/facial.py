import cv2
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch

# Load the emotion recognition model
model_name = "trpakov/vit-face-expression"
try:
    processor = AutoImageProcessor.from_pretrained(model_name)
    model = AutoModelForImageClassification.from_pretrained(model_name)
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

# Load OpenCV's pre-trained face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Initialize webcam
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

print("Webcam is open.")

while True:
    try:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame.")
            break

        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # Detect faces in the frame
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

        if len(faces) == 0:
            print("No faces detected.")
            continue

        for (x, y, w, h) in faces:
            # Extract the face region
            face = frame[y:y+h, x:x+w]
            # Convert to RGB and resize to 224x224
            rgb_face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(rgb_face).resize((224, 224))

            # Prepare the image for the model
            inputs = processor(images=pil_image, return_tensors="pt")
            with torch.no_grad():
                outputs = model(**inputs)
                logits = outputs.logits
                predicted_class_idx = logits.argmax(-1).item()
                emotion = model.config.id2label[predicted_class_idx]

            # Display the emotion label and bounding box on the frame
            cv2.putText(frame, f"Emotion: {emotion}", (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

        # Show the frame with annotations
        cv2.imshow("Real-Time Emotion Recognition", frame)

        # Exit loop when 'q' key is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    except Exception as e:
        print(f"Error during processing: {e}")
        break

# Release resources
cap.release()
cv2.destroyAllWindows()