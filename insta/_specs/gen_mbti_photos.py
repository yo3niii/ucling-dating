import os, sys
from google import genai
from google.genai import types

client = genai.Client()
OUT = os.path.join(os.path.dirname(__file__), "photos")
os.makedirs(OUT, exist_ok=True)

STYLE = ("Shot on 35mm film, warm natural window light, soft pink and peach muted tones, "
         "subtle film grain, cozy Korean cafe date aesthetic, no visible faces, minimal, tasteful, aesthetic, high quality.")

JOBS = [
    ("mbti_00_cover", "4:3", "Two coffee cups and a small slice of cake on a light wood cafe table beside a sunny window, seen from a gentle overhead angle, one hand resting near a cup."),
    ("mbti_body_1", "3:4", "Extreme close-up of two hands gently holding warm latte cups across a cafe table."),
    ("mbti_body_2", "3:4", "A slice of strawberry cake and a latte on a marble cafe table, soft window light, from above."),
    ("mbti_body_3", "3:4", "Two young people walking side by side seen from behind on a quiet tree-lined city street in autumn, warm tones."),
    ("mbti_body_4", "3:4", "Flatlay of a vintage film camera, dried flowers and a coffee cup on a pastel pink table."),
    ("mbti_body_5", "3:4", "A cozy cafe window seat with a small potted plant and sunlight streaming across an empty wooden chair."),
    ("mbti_body_6", "3:4", "Two hands clinking iced pink drinks together above a cafe table, only hands visible."),
    ("mbti_07_cta", "3:4", "Hands shaping clay on a pottery wheel in a warm sunlit one-day craft class studio, cozy inviting mood."),
]

ok, fail = [], []
for name, ratio, scene in JOBS:
    try:
        resp = client.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents=f"{scene} {STYLE}",
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                image_config=types.ImageConfig(aspect_ratio=ratio, image_size="2K"),
            ),
        )
        saved = False
        for part in resp.parts:
            img = part.as_image() if hasattr(part, "as_image") else None
            if img:
                p = os.path.join(OUT, f"{name}.png")
                img.save(p); ok.append(p); saved = True; break
        if not saved:
            fail.append((name, "no image in response"))
    except Exception as e:
        fail.append((name, str(e)[:200]))

print("OK:", len(ok))
for p in ok: print("  ", p)
if fail:
    print("FAIL:", len(fail))
    for n, e in fail: print("  ", n, "->", e)
