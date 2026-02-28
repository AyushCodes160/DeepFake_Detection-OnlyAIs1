import urllib.request
import json

url = "https://huggingface.co/api/models/prithivMLmods/AI-vs-Deepfake-vs-Real-v2.0"
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    print("Labels mapping:")
    print(data.get('config', {}).get('id2label', "Not found in config, checking siblings..."))

url2 = "https://huggingface.co/prithivMLmods/AI-vs-Deepfake-vs-Real-v2.0/raw/main/config.json"
try:
    req2 = urllib.request.Request(url2)
    with urllib.request.urlopen(req2) as res2:
        conf = json.loads(res2.read().decode())
        print("Config.json labels:", conf.get('id2label'))
except Exception as e:
    print(e)
