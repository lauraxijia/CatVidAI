
Run:
```
uvicorn main:app --reload
```

Test:
```
curl -X 'POST' 'http://127.0.0.1:8000/generate_image' \
     -H 'Content-Type: application/json' \
     -d '{
           "prompt": "A futuristic cityscape at sunset",
           "width": 1024,
           "height": 1024,
           "num_inference_steps": 30,
           "negative_prompt": "",
           "seed": -1
         }'

```