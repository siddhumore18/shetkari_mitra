"""
KrishiBandhu – Unified ML Inference Server
Supports:
1. Tri-Model Ensemble (YOLOv8 + EfficientNet-B0 + MobileNetV2)
2. ViT General for Crop Identification
3. YouTube Search for video recommendations
4. Facility Scraper for nearby processing centers

Run: python app.py  (starts on http://localhost:8000)
"""

import os
import io
import json
import uvicorn
import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# ── Pre-declare globals ───────────────────────────────────────────────────────
ensemble = None
vit_gen_ready = False
vit_gen_model = None
vit_gen_processor = None

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)
YOLO_MODEL_PATH = os.path.join(BASE_DIR, "runs", "detect", "train", "weights", "best.pt")
YOLO_FALLBACK   = os.path.join(BASE_DIR, "yolov8s.pt")

CLASS_NAMES_PATH   = os.path.join(BASE_DIR, "pretrained_models", "class_names.json")
EFFICIENTNET_PATH  = os.path.join(BASE_DIR, "pretrained_models", "efficientnet_plant.pth", "efficientnet_plant")
MOBILENET_PATH     = os.path.join(BASE_DIR, "pretrained_models", "mobilenetv2_plant.pth", "mobilenetv2_plant")

VIT_GENERAL_NAME = "google/vit-base-patch16-224"

# ── Background Model Loading ───────────────────────────────────────────────────
def background_model_loading():
    global ensemble, vit_gen_ready, vit_gen_model, vit_gen_processor

    print("[*] Loading AI models in background thread...")
    try:
        # Local ensemble (YOLO + EfficientNet + MobileNet)
        from multi_model import MultiModelEnsemble
        yolo_target = YOLO_MODEL_PATH if os.path.exists(YOLO_MODEL_PATH) else YOLO_FALLBACK
        ensemble = MultiModelEnsemble(
            yolo_path=yolo_target,
            eff_path=EFFICIENTNET_PATH,
            mob_path=MOBILENET_PATH,
            class_names_path=CLASS_NAMES_PATH
        )
        print(f"[+] Tri-Model Ensemble ready.")

        # General ViT for /identify-crop
        from transformers import ViTForImageClassification, ViTImageProcessor
        print(f"[*] Loading General ViT ({VIT_GENERAL_NAME})...")
        vit_gen_processor = ViTImageProcessor.from_pretrained(VIT_GENERAL_NAME)
        vit_gen_model = ViTForImageClassification.from_pretrained(VIT_GENERAL_NAME)
        vit_gen_model.eval()
        vit_gen_ready = True
        print("[+] ViT General ready.")

    except Exception as e:
        print(f"[-] Startup failure: {e}")
        import traceback
        traceback.print_exc()

# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[*] Web server starting. Backgrounding model load...")
    t = threading.Thread(target=background_model_loading, daemon=True)
    t.start()
    yield

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="KrishiBandhu ML Server", version="3.1", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "online" if ensemble else "loading",
        "ensemble_ready":      ensemble is not None,
        "yolo_active":         ensemble.yolo_model is not None if ensemble else False,
        "efficientnet_active": ensemble.eff_model  is not None if ensemble else False,
        "mobilenet_active":    ensemble.mob_model  is not None if ensemble else False,
        "vit_ready":           vit_gen_ready,
        "supported_crops":     ["Banana", "Chilli", "Radish", "Groundnut", "Cauliflower"],
    }

# ── Predict ───────────────────────────────────────────────────────────────────
@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    crop: str = Form(default=""),
    mode: str = Form(default="auto")
):
    if not ensemble:
        raise HTTPException(
            status_code=503,
            detail="AI models are still loading. Please wait 1–2 minutes and try again."
        )

    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        result = ensemble.predict(img, user_crop=crop)
        return result
    except Exception as e:
        print(f"[-] Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── Identify Crop ─────────────────────────────────────────────────────────────
@app.post("/identify-crop")
async def identify_crop(file: UploadFile = File(...)):
    if not vit_gen_ready:
        raise HTTPException(status_code=503, detail="Identification model is still loading.")

    try:
        import torch
        import torch.nn.functional as F

        img_bytes = await file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        inputs = vit_gen_processor(images=img, return_tensors="pt")
        with torch.no_grad():
            outputs = vit_gen_model(**inputs)
            probs = F.softmax(outputs.logits, dim=-1)
            conf, idx = torch.max(probs, -1)

        label = vit_gen_model.config.id2label[idx.item()]
        detected_crop = label.split("___")[0] if "___" in label else label

        return {
            "relevant": True,
            "detectedCrop": detected_crop,
            "confidence": round(float(conf) * 100, 2)
        }
    except Exception as e:
        print(f"[-] Identification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── YouTube Search ────────────────────────────────────────────────────────────
@app.post("/youtube-search")
async def youtube_search(
    query:    str = Form(...),
    language: str = Form(default="english")
):
    try:
        from youtube_search import search_videos
        results = search_videos(query=query, language=language)
        return {"success": True, "videos": results}
    except Exception as e:
        return {"success": False, "error": str(e), "videos": []}

# ── Facilities ────────────────────────────────────────────────────────────────
@app.get("/search-facilities")
async def search_facilities(
    lat: float, lon: float,
    radius: float = 50,
    city: str = None
):
    try:
        from scraper_service import get_hybrid_facilities
        results = get_hybrid_facilities(lat, lon, radius, city)
        return {"success": True, "data": results}
    except Exception as e:
        return {"success": False, "data": [], "error": str(e)}

# ── Entry Point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
