import os
from transformers import AutoImageProcessor, AutoModelForImageClassification

def download_models():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    weights_dir = os.path.join(base_dir, 'models', 'weights')
    
    # 1. FaceForensics Deepfake ViT
    print("Downloading FaceForensics Deepfake ViT...")
    model1_name = "dima806/deepfake_vs_real_image_detection"
    model1_dir = os.path.join(weights_dir, "deepfake_vs_real_image_detection")
    
    processor1 = AutoImageProcessor.from_pretrained(model1_name)
    model1 = AutoModelForImageClassification.from_pretrained(model1_name)
    
    processor1.save_pretrained(model1_dir)
    model1.save_pretrained(model1_dir)
    print(f"Saved to {model1_dir}")
    
    # 2. Generative AI Detector
    print("\nDownloading Generative AI Detector...")
    model2_name = "prithivMLmods/AI-vs-Deepfake-vs-Real-v2.0"
    model2_dir = os.path.join(weights_dir, "ai_vs_deepfake_vs_real")
    
    processor2 = AutoImageProcessor.from_pretrained(model2_name)
    model2 = AutoModelForImageClassification.from_pretrained(model2_name)
    
    processor2.save_pretrained(model2_dir)
    model2.save_pretrained(model2_dir)
    print(f"Saved to {model2_dir}")

if __name__ == "__main__":
    download_models()
    print("\nDone! All models downloaded for 100% offline use.")
