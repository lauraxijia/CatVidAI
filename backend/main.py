import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI

# Initialize FastAPI app
app = FastAPI()

# Initialize OpenAI client
client = OpenAI(
    base_url="https://api.studio.nebius.ai/v1/",
    api_key=os.environ.get("NEBIUS_API_KEY")
)

# Request model
class ImageRequest(BaseModel):
    prompt: str
    width: int = 1024
    height: int = 1024
    num_inference_steps: int = 30
    negative_prompt: str = ""
    seed: int = -1

# API endpoint to generate an image
@app.post("/generate_image")
async def generate_image(request: ImageRequest):
    try:
        response = client.images.generate(
            model="stability-ai/sdxl",
            response_format="url",  # Request image as URL
            extra_body={
                "response_extension": "png",
                "width": request.width,
                "height": request.height,
                "num_inference_steps": request.num_inference_steps,
                "negative_prompt": request.negative_prompt,
                "seed": request.seed,
            },
            prompt=request.prompt
        )
        
        # Extract image URL (Fix: Directly access .data property)
        if not response or not response.data:
            raise HTTPException(status_code=500, detail="Failed to retrieve image URL")

        return {"image_url": response.data[0].url}  # Fix: Access image URL correctly

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
