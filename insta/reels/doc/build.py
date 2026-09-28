#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
우클링 하루연애 — 정보전달형 세로 숏폼(20초) 빌더
무료 오픈소스만 사용: edge-tts(나레이션) + Pillow(자막 PNG) + ffmpeg(켄번즈/합성)

실행:  ./venv/bin/python build.py
출력:  out/ucling_doc_v1.mp4  +  out/frame_*.png (검증용 대표 프레임)

이 ffmpeg 빌드에는 drawtext/subtitles(libass)가 없어서, 자막은 Pillow로
투명 PNG를 그린 뒤 ffmpeg overlay로 합성한다.
"""

# ═══════════════════════════════════════════════════════════════════
#  파라미터 — 여기만 바꾸면 됩니다
# ═══════════════════════════════════════════════════════════════════
VOICE        = "ko-KR-SunHiNeural"   # edge-tts 음성 (남성: ko-KR-InJoonNeural)
RATE         = "+15%"                # 말 속도 (+10%, -5% 등)
CROSSFADE    = 0.5                   # 컷 사이 크로스페이드(초)
TAIL_PAD     = 0.3                   # 각 컷 나레이션 뒤 여백(초)
FINALE_EXTRA = 0.4                   # 마지막 컷 추가 여유(천천히)
MIN_SCENE    = 3.0                   # 컷 최소 길이(초)
BGM_VOL      = 0.12                  # BGM 볼륨 (나레이션 대비 낮게)
SUB_SIZE     = 62                    # 자막 글자 크기(px)
SUB_BOTTOM   = 300                   # 자막 하단 여백(px)
SUB_MAX_W    = 900                   # 자막 최대 폭(px, 넘으면 줄바꿈)
KEN_ZOOM     = 1.12                  # 켄번즈 최대 줌 배율
OUT_NAME     = "ucling_doc_v1.mp4"

# 자막 색 (브랜드킷: 본문 plum, 핑크는 텍스트 금지)
SUB_FILL     = (255, 255, 255, 255)  # 흰 글자
SUB_STROKE   = (43, 27, 36, 255)     # plum #2b1b24 외곽선
STROKE_W     = 8

W, H, FPS = 1080, 1920, 30

# 씬 구성 (대본은 사용자 확인 완료 · 검증된 사실만 · 숫자는 나레이션용 한글)
#   ken: 켄번즈 방향  in=줌인 / out=줌아웃 / inL=줌인+좌팬 / inR=줌인+우팬 / slow=느린 줌인
SCENES = [
    dict(img="bg_street.png",   ken="in",
         say="우클링 하루연애는, 원데이 클래스에서 만나는 소개팅이에요.",
         sub="원데이 클래스에서 만나는 소개팅"),
    dict(img="bg_pinkroom.png", ken="out",
         say="향수나 쿠킹 클래스에서, 삼 대 삼으로 만나요.",
         sub="향수·쿠킹 클래스에서 3:3 매칭"),
    dict(img="bg_class.png",    ken="inR",
         say="이름은 안 받아요. 닉네임과 취향만 남기면 돼요.",
         sub="이름 없이 닉네임·취향만"),
    dict(img="bg_room.png",     ken="in",
         say="마음에 들면 몰래 지목하고, 통하면 연결돼요.",
         sub="마음에 들면 ‘사랑의 작대기’"),
    dict(img="text/cta.png",    ken="slow",
         say="신청은 구월 이십육일까지. 프로필 링크에서 신청하세요.",
         sub="신청 ~9/26 · @ucling.official"),
]
# ═══════════════════════════════════════════════════════════════════

import os, sys, subprocess, shutil, json

HERE   = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.abspath(os.path.join(HERE, "..", "assets"))
WORK   = os.path.join(HERE, "work")
OUT    = os.path.join(HERE, "out")
FONT   = os.path.expanduser("~/Library/Fonts/PretendardVariable.ttf")
BGM    = os.path.join(ASSETS, "bgm_sunny.mp3")

os.makedirs(WORK, exist_ok=True)
os.makedirs(OUT, exist_ok=True)


def run(cmd, **kw):
    """서브프로세스 실행 (실패 시 중단)."""
    print("  $", " ".join(str(c) for c in cmd[:6]), "…" if len(cmd) > 6 else "")
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print("STDERR:", r.stderr[-1500:])
        raise SystemExit(f"명령 실패: {cmd[0]}")
    return r


def ffprobe_dur(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path],
        capture_output=True, text=True)
    return float(r.stdout.strip())


# ── 1. 나레이션(edge-tts) + 길이 측정 ────────────────────────────────
def make_tts():
    import edge_tts, asyncio
    durs = []
    for i, sc in enumerate(SCENES):
        mp3 = os.path.join(WORK, f"say{i}.mp3")

        async def _gen(text=sc["say"], out=mp3):
            c = edge_tts.Communicate(text, VOICE, rate=RATE)
            await c.save(out)
        asyncio.run(_gen())

        d = ffprobe_dur(mp3)
        dur = max(MIN_SCENE, d + TAIL_PAD)
        if i == len(SCENES) - 1:
            dur += FINALE_EXTRA
        durs.append(round(dur, 3))
        print(f"  컷{i+1}: TTS {d:.2f}s → 컷길이 {dur:.2f}s")
    return durs


# ── 2. 자막 PNG(Pillow) ─────────────────────────────────────────────
def wrap_text(draw, text, font, max_w):
    """공백 기준으로 max_w 안에 들어오게 줄바꿈."""
    words = text.split(" ")
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def make_subs():
    from PIL import Image, ImageDraw, ImageFont
    try:
        font = ImageFont.truetype(FONT, SUB_SIZE)
    except OSError:
        font = ImageFont.truetype(FONT, SUB_SIZE, layout_engine=ImageFont.Layout.BASIC)

    for i, sc in enumerate(SCENES):
        img  = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # 하단 소프트 스크림(가독성) — 아래로 갈수록 진해지는 반투명 검정
        scrim_top = H - SUB_BOTTOM - SUB_SIZE * 3
        for y in range(scrim_top, H):
            a = int(150 * (y - scrim_top) / (H - scrim_top))
            draw.line([(0, y), (W, y)], fill=(20, 12, 17, max(0, min(150, a))))

        lines = wrap_text(draw, sc["sub"], font, SUB_MAX_W)
        lh = SUB_SIZE + 18
        total_h = lh * len(lines)
        y = H - SUB_BOTTOM - total_h
        for line in lines:
            tw = draw.textlength(line, font=font)
            x = (W - tw) / 2
            draw.text((x, y), line, font=font, fill=SUB_FILL,
                      stroke_width=STROKE_W, stroke_fill=SUB_STROKE)
            y += lh

        img.save(os.path.join(WORK, f"sub{i}.png"))
    print(f"  자막 PNG {len(SCENES)}장 생성")


# ── 3. 씬 클립(켄번즈 + 자막 오버레이) ───────────────────────────────
def kenburns_expr(ken, frames):
    """zoompan용 z/x/y 표현식. 미리 2배 스케일된 입력 전제."""
    z_in  = f"min(zoom+{(KEN_ZOOM-1)/frames:.6f},{KEN_ZOOM})"
    z_out = f"if(eq(on,0),{KEN_ZOOM},max(zoom-{(KEN_ZOOM-1)/frames:.6f},1.0))"
    cx = "iw/2-(iw/zoom/2)"          # 중앙
    cxL = "iw/2-(iw/zoom/2)-(on/{n})*120".format(n=frames)  # 좌로 팬
    cxR = "iw/2-(iw/zoom/2)+(on/{n})*120".format(n=frames)  # 우로 팬
    cy = "ih/2-(ih/zoom/2)"
    if ken == "out":
        return z_out, cx, cy
    if ken == "inL":
        return z_in, cxL, cy
    if ken == "inR":
        return z_in, cxR, cy
    if ken == "slow":
        z_slow = f"min(zoom+{(KEN_ZOOM-1)/frames*0.6:.6f},{KEN_ZOOM})"
        return z_slow, cx, cy
    return z_in, cx, cy  # "in" 기본


def make_scene_clips(durs):
    for i, (sc, dur) in enumerate(zip(SCENES, durs)):
        src = os.path.join(ASSETS, sc["img"])
        if not os.path.exists(src):
            raise SystemExit(f"이미지 없음: {src}")
        sub = os.path.join(WORK, f"sub{i}.png")
        out = os.path.join(WORK, f"scene{i}.mp4")
        frames = max(1, int(round(dur * FPS)))
        z, x, y = kenburns_expr(sc["ken"], frames)

        # cover 스케일 → 2배 업스케일(zoompan 지터 완화) → 켄번즈 → 1080x1920 → 자막 overlay
        vf = (
            f"[0:v]scale={W*2}:{H*2}:force_original_aspect_ratio=increase,"
            f"crop={W*2}:{H*2},setsar=1[base];"
            f"[base]zoompan=z='{z}':x='{x}':y='{y}':d={frames}:"
            f"s={W}x{H}:fps={FPS}[kb];"
            f"[kb][1:v]overlay=0:0:format=auto[v]"
        )
        run(["ffmpeg", "-y", "-loop", "1", "-i", src, "-i", sub,
             "-filter_complex", vf, "-map", "[v]",
             "-t", f"{dur}", "-r", str(FPS),
             "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium",
             out])
        print(f"  컷{i+1} 클립 완료 ({dur:.2f}s)")


# ── 4. 비디오 xfade 체인 ─────────────────────────────────────────────
def concat_video(durs):
    inputs = []
    for i in range(len(SCENES)):
        inputs += ["-i", os.path.join(WORK, f"scene{i}.mp4")]

    # xfade 누적 offset: 각 전환은 (지금까지 붙은 길이 - CROSSFADE) 지점에서 시작
    fc, prev, acc = [], "[0:v]", durs[0]
    for i in range(1, len(SCENES)):
        off = acc - CROSSFADE
        lbl = f"[vx{i}]"
        fc.append(f"{prev}[{i}:v]xfade=transition=fade:duration={CROSSFADE}:"
                  f"offset={off:.3f}{lbl}")
        prev = lbl
        acc = acc + durs[i] - CROSSFADE
    out = os.path.join(WORK, "video.mp4")
    run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(fc),
         "-map", prev, "-c:v", "libx264", "-pix_fmt", "yuv420p",
         "-preset", "medium", "-r", str(FPS), out])
    return out, acc  # acc = 총 길이


# ── 5. 오디오(나레이션 배치 + BGM) ──────────────────────────────────
def build_audio(durs, total):
    starts, acc = [], 0.0
    for i in range(len(SCENES)):
        starts.append(acc)
        acc = acc + durs[i] - CROSSFADE

    inputs = []
    for i in range(len(SCENES)):
        inputs += ["-i", os.path.join(WORK, f"say{i}.mp3")]
    inputs += ["-i", BGM]
    bgm_idx = len(SCENES)

    fc = []
    voice_lbls = []
    for i in range(len(SCENES)):
        delay = int(starts[i] * 1000)
        fc.append(f"[{i}:a]adelay={delay}|{delay},apad[va{i}]")
        voice_lbls.append(f"[va{i}]")
    fc.append("".join(voice_lbls) + f"amix=inputs={len(SCENES)}:"
              f"normalize=0:duration=longest[voice]")
    # BGM: 루프→볼륨→끝 페이드아웃
    fc.append(f"[{bgm_idx}:a]aloop=loop=-1:size=2e9,volume={BGM_VOL},"
              f"afade=t=out:st={max(0,total-1.2):.3f}:d=1.2[bg]")
    fc.append(f"[voice][bg]amix=inputs=2:normalize=0:duration=first,"
              f"atrim=0:{total:.3f},aformat=sample_rates=48000[aout]")

    out = os.path.join(WORK, "audio.m4a")
    run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(fc),
         "-map", "[aout]", "-c:a", "aac", "-b:a", "192k", out])
    return out


# ── 6. 최종 mux + 검증 ──────────────────────────────────────────────
def mux(video, audio, total):
    final = os.path.join(OUT, OUT_NAME)
    run(["ffmpeg", "-y", "-i", video, "-i", audio,
         "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy",
         "-shortest", "-movflags", "+faststart", final])
    return final


def verify(final):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,r_frame_rate:format=duration",
         "-of", "json", final], capture_output=True, text=True)
    info = json.loads(r.stdout)
    st = info["stream"][0] if "stream" in info else info["streams"][0]
    dur = float(info["format"]["duration"])
    for f in os.listdir(OUT):            # 이전 실행의 프레임 정리
        if f.startswith("frame_"):
            os.remove(os.path.join(OUT, f))
    print("\n═══ 검증 ═══")
    print(f"  해상도 : {st['width']}x{st['height']}")
    print(f"  fps    : {st['r_frame_rate']}")
    print(f"  길이   : {dur:.2f}s")
    has_audio = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries",
         "stream=codec_type", "-of", "csv=p=0", final],
        capture_output=True, text=True).stdout.strip()
    print(f"  오디오 : {'있음(' + has_audio + ')' if has_audio else '없음!'}")

    # 대표 프레임 2~3장
    for t in (2.0, dur * 0.5, dur - 1.0):
        fp = os.path.join(OUT, f"frame_{t:.1f}.png")
        subprocess.run(["ffmpeg", "-y", "-ss", f"{t}", "-i", final,
                        "-frames:v", "1", fp],
                       capture_output=True, text=True)
    print(f"  프레임 : out/frame_*.png 3장")


def main():
    print("① 나레이션(edge-tts) 생성…")
    durs = make_tts()
    print("② 자막 PNG(Pillow) 생성…")
    make_subs()
    print("③ 씬 클립(켄번즈+자막)…")
    make_scene_clips(durs)
    print("④ 비디오 크로스페이드 합성…")
    video, total = concat_video(durs)
    print(f"   총 길이 ≈ {total:.2f}s")
    print("⑤ 오디오(나레이션+BGM)…")
    audio = build_audio(durs, total)
    print("⑥ 최종 mux…")
    final = mux(video, audio, total)
    verify(final)
    print(f"\n✅ 완료: {final}")


if __name__ == "__main__":
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            raise SystemExit(f"{tool} 없음")
    main()
