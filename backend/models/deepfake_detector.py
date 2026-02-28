import cv2
import mediapipe as mp
import torch
import torchvision.transforms as transforms
from PIL import Image
import numpy as np

class DeepfakeDetector:
    def __init__(self):
        # Initialize MediaPipe Face Detection using the modern Tasks API
        # Needs the downloaded TFLite model:
        import os
        model_path = os.path.join(os.path.dirname(__file__), 'weights', 'blaze_face_short_range.tflite')
        
        from mediapipe.tasks import python
        from mediapipe.tasks.python import vision
        
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.FaceDetectorOptions(base_options=base_options, min_detection_confidence=0.5)
        self.face_detector = vision.FaceDetector.create_from_options(options)

        # Initialize Real Deepfake Model (Vision Transformer from Hugging Face)
        from transformers import AutoImageProcessor, AutoModelForImageClassification
        
        if torch.cuda.is_available():
            self.device = torch.device('cuda')
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            self.device = torch.device('mps') # Apple Silicon GPU Native
        else:
            self.device = torch.device('cpu')
            
        print(f"Loading FaceForensics Deepfake ViT into {self.device}...")
        self.processor = AutoImageProcessor.from_pretrained("dima806/deepfake_vs_real_image_detection")
        self.model = AutoModelForImageClassification.from_pretrained("dima806/deepfake_vs_real_image_detection")
        
        self.model.to(self.device)
        self.model.eval()
        print("FaceForensics Deepfake ViT model loaded and ready!")
        
        # Initialize Generative AI Detector Model (PrithivMLMods)
        print(f"Loading Generative AI Detector model into {self.device}...")
        self.ai_processor = AutoImageProcessor.from_pretrained("prithivMLmods/AI-vs-Deepfake-vs-Real-v2.0")
        self.ai_model = AutoModelForImageClassification.from_pretrained("prithivMLmods/AI-vs-Deepfake-vs-Real-v2.0")
        self.ai_model.to(self.device)
        self.ai_model.eval()
        print("Generative AI Detector model loaded and ready!")
        
        # Buffer for mock demo smoothing to prevent UI flickering
        self._last_prob_faceswap = 0.5
        self._last_prob_ai = 0.5

    def detect_faces(self, image_np: np.ndarray):
        """
        Detects faces in an image using MediaPipe Tasks API.
        Returns a list of bounding boxes: [{"xmin": ..., "ymin": ..., "width": ..., "height": ...}, ...]
        """
        image_rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
        
        detection_result = self.face_detector.detect(mp_image)
        
        faces = []
        if detection_result.detections:
            for detection in detection_result.detections:
                bboxC = detection.bounding_box
                # The tasks API returns absolute pixel coordinates
                faces.append({
                    "xmin": max(0, bboxC.origin_x),
                    "ymin": max(0, bboxC.origin_y),
                    "width": bboxC.width,
                    "height": bboxC.height
                })
        return faces

    def process_frame(self, image_np: np.ndarray, analysis_mode: str = "faceswap"):
        """
        Processes a single frame: Detects faces (if faceswap) and runs inference on the respective model.
        """
        results = []
        
        # --- MODE 1: Generative AI Video (Full Frame Analysis) ---
        if analysis_mode == "ai_generated":
            frame_pil = Image.fromarray(cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB))
            inputs = self.ai_processor(images=frame_pil, return_tensors="pt").to(self.device)
            
            with torch.no_grad():
                outputs = self.ai_model(**inputs)
                
            # Model Labels for AI-vs-Deepfake-vs-Real-v2.0: {0: 'Artificial', 1: 'Deepfake', 2: 'Real'}
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            # Sum Artificial + Deepfake scores for maximum accuracy against AI Generators
            new_prob = probs[0][0].item() + probs[0][1].item()
            
            alpha = 0.6 if new_prob > self._last_prob_ai else 0.1
            fake_prob = (alpha * new_prob) + ((1 - alpha) * self._last_prob_ai)
            self._last_prob_ai = fake_prob
            
            status = "FAKE" if fake_prob > 0.5 else "REAL"
            
            # The AI Generator model analyzes the full frame, but the UI looks best if we track the face
            # We will use MediaPipe to track the faces, but attach the full-frame AI probability to them.
            faces = self.detect_faces(image_np)
            if not faces:
                # If no humans are in the AI video, return a generic full-frame bounding box
                return [{
                    "bbox": {"x": 0, "y": 0, "w": image_np.shape[1], "h": image_np.shape[0]},
                    "confidence": float(fake_prob),
                    "status": status
                }]
                
            for face in faces:
                x, y, w, h = face["xmin"], face["ymin"], face["width"], face["height"]
                pad_x = int(w * 0.5)
                pad_y = int(h * 0.5)
                ui_x1 = max(0, x - pad_x)
                ui_y1 = max(0, y - pad_y)
                ui_x2 = min(image_np.shape[1], x + w + pad_x)
                ui_y2 = min(image_np.shape[0], y + h + pad_y)
                
                results.append({
                    "bbox": {"x": ui_x1, "y": ui_y1, "w": ui_x2-ui_x1, "h": ui_y2-ui_y1},
                    "confidence": float(fake_prob),
                    "status": status
                })
            return results
        
        # --- MODE 2: Deepfake Face-Swap (Face Crop Analysis) ---
        faces = self.detect_faces(image_np)

        for face in faces:
            # Crop the face
            x, y, w, h = face["xmin"], face["ymin"], face["width"], face["height"]
            
            # Padded box for frontend UI to look natural (and for the AI to see the whole head)
            pad_x = int(w * 0.5)
            pad_y = int(h * 0.5)
            ui_x1 = max(0, x - pad_x)
            ui_y1 = max(0, y - pad_y)
            ui_x2 = min(image_np.shape[1], x + w + pad_x)
            ui_y2 = min(image_np.shape[0], y + h + pad_y)

            if ui_x2 <= ui_x1 or ui_y2 <= ui_y1:
                continue
                
            # Most Vision Transformers require the whole head + some background to establish a baseline.
            face_img = image_np[ui_y1:ui_y2, ui_x1:ui_x2]
            
            # Prepare image inputs for ViT via HuggingFace Processor
            face_pil = Image.fromarray(cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB))
            inputs = self.processor(images=face_pil, return_tensors="pt").to(self.device)

            # Genuine AI Inference
            with torch.no_grad():
                outputs = self.model(**inputs)
                
            # Model Labels for FaceForensics (Dima806): {0: 'Real', 1: 'FaceSwap Deepfake'}
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1)
            new_prob = probs[0][1].item() # Extract the probability of class 1 (FaceSwap Deepfake)
            
            # Asymmetric smoothing
            alpha = 0.6 if new_prob > self._last_prob_faceswap else 0.1
            fake_prob = (alpha * new_prob) + ((1 - alpha) * self._last_prob_faceswap)
            self._last_prob_faceswap = fake_prob
            
            status = "FAKE" if fake_prob > 0.5 else "REAL"

            results.append({
                # Return the padded coordinates so the UI box covers the whole head
                "bbox": {"x": ui_x1, "y": ui_y1, "w": ui_x2-ui_x1, "h": ui_y2-ui_y1},
                "confidence": float(fake_prob),
                "status": status
            })

        return results

