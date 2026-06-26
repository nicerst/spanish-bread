from functools import lru_cache
from io import BytesIO
import os
from pathlib import Path

import soundfile as sf
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import espeakng_loader
from phonemizer.backend.espeak.wrapper import EspeakWrapper

SYSTEM_ESPEAK_ROOT = Path(r"C:\Program Files\eSpeak NG")
SYSTEM_ESPEAK_LIBRARY = SYSTEM_ESPEAK_ROOT / "libespeak-ng.dll"
SYSTEM_ESPEAK_DATA = SYSTEM_ESPEAK_ROOT / "espeak-ng-data"

if SYSTEM_ESPEAK_LIBRARY.exists() and SYSTEM_ESPEAK_DATA.exists():
    os.add_dll_directory(str(SYSTEM_ESPEAK_ROOT))
    ESPEAK_LIBRARY = str(SYSTEM_ESPEAK_LIBRARY)
    ESPEAK_DATA = str(SYSTEM_ESPEAK_DATA)
else:
    ESPEAK_LIBRARY = espeakng_loader.get_library_path()
    ESPEAK_DATA = espeakng_loader.get_data_path()

os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = ESPEAK_LIBRARY
os.environ["PHONEMIZER_ESPEAK_DATA_PATH"] = ESPEAK_DATA
EspeakWrapper.set_library(ESPEAK_LIBRARY)
EspeakWrapper.set_data_path(ESPEAK_DATA)

from kokoro import KPipeline
from phonemizer.backend import EspeakBackend
from pydantic import BaseModel, Field

EspeakWrapper.set_library(ESPEAK_LIBRARY)
EspeakWrapper.set_data_path(ESPEAK_DATA)
_SUPPORTED_ESPEAK_LANGUAGES = EspeakBackend.supported_languages()
EspeakBackend.supported_languages = classmethod(lambda cls: _SUPPORTED_ESPEAK_LANGUAGES)


class TtsRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    kokoroLang: str = "e"
    voice: str = "ef_dora"
    speed: float = Field(default=1.0, ge=0.7, le=1.3)


app = FastAPI(title="Spanish Bread Kokoro TTS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@lru_cache(maxsize=4)
def pipeline_for(lang_code: str) -> KPipeline:
    return KPipeline(lang_code=lang_code)


@app.post("/api/tts")
def tts(request: TtsRequest) -> Response:
    if request.kokoroLang != "e":
        raise HTTPException(status_code=400, detail="Only Spanish Kokoro lang code 'e' is enabled.")

    pipeline = pipeline_for(request.kokoroLang)
    generator = pipeline(
        request.text,
        voice=request.voice,
        speed=request.speed,
        split_pattern=r"\n+",
    )

    chunks = [audio for _, _, audio in generator]
    if not chunks:
        raise HTTPException(status_code=422, detail="No audio generated.")

    output = BytesIO()
    sf.write(output, np.concatenate(chunks), 24000, format="WAV")

    return Response(content=output.getvalue(), media_type="audio/wav")
