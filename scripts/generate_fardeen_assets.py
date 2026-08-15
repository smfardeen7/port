from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CAREER = ROOT / "static" / "career"
PROJECTS = ROOT / "static" / "projects" / "images"
LAB = ROOT / "static" / "lab" / "images"

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]


def font(size):
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def career_label(path, lines, line_height=28, pad_x=10, pad_y=4, gap=4):
    f = font(22)
    widths = []
    dummy = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    for line in lines:
        bbox = dummy.textbbox((0, 0), line, font=f)
        widths.append(bbox[2] - bbox[0])
    width = max(widths) + pad_x * 2 + 8
    height = len(lines) * line_height + gap * (len(lines) - 1) + 4
    img = Image.new("RGBA", (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    y = 2
    for i, line in enumerate(lines):
        bar_w = widths[i] + pad_x * 2
        draw.rectangle([0, y, bar_w, y + line_height], fill=(0, 255, 0, 255))
        bbox = draw.textbbox((0, 0), line, font=f)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        tx = pad_x - bbox[0]
        ty = y + (line_height - th) / 2 - bbox[1]
        draw.text((tx, ty), line, font=f, fill=(255, 0, 0, 255))
        y += line_height + gap
    img.save(path)


def rounded_rect(draw, xy, radius, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def project_card(path, title, subtitle, tags, accent, mini=False):
    if mini:
        w, h = 240, 136
        title_size, sub_size, tag_size = 22, 12, 10
        pad = 16
    else:
        w, h = 960, 540
        title_size, sub_size, tag_size = 64, 28, 20
        pad = 48

    img = Image.new("RGBA", (w, h), (29, 23, 33, 255))
    draw = ImageDraw.Draw(img)

    # background wash
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle([0, 0, w, int(h * 0.55)], fill=(*accent, 55))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    draw.rectangle([0, 0, 12 if not mini else 6, h], fill=accent)
    draw.rectangle([0, h - (10 if not mini else 5), w, h], fill=accent)

    title_font = font(title_size)
    sub_font = font(sub_size)
    tag_font = font(tag_size)
    label_font = font(14 if mini else 22)

    draw.text((pad, pad), "FARDEEN", font=label_font, fill=(182, 95, 255, 255))
    draw.text((pad, pad + (22 if mini else 56)), title, font=title_font, fill=(255, 255, 255, 255))

    # wrap subtitle
    max_width = w - pad * 2
    words = subtitle.split()
    lines, current = [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), trial, font=sub_font)
        if bbox[2] - bbox[0] > max_width and current:
            lines.append(current)
            current = word
        else:
            current = trial
    if current:
        lines.append(current)
    y = pad + (52 if mini else 160)
    for line in lines[:4 if not mini else 2]:
        draw.text((pad, y), line, font=sub_font, fill=(220, 210, 230, 255))
        y += sub_size + (4 if mini else 10)

    tx = pad
    ty = h - pad - (28 if mini else 52)
    for tag in tags[:5]:
        bbox = draw.textbbox((0, 0), tag, font=tag_font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        rw, rh = tw + (12 if mini else 24), th + (8 if mini else 16)
        if tx + rw > w - pad:
            break
        rounded_rect(draw, [tx, ty, tx + rw, ty + rh], 8 if mini else 14, (37, 31, 43, 255))
        draw.text((tx + (6 if mini else 12), ty + (3 if mini else 6)), tag, font=tag_font, fill=accent)
        tx += rw + (6 if mini else 12)

    img.save(path)


CAREER_LABELS = {
    "careerFreelancer.png": ["AI ENGINEER", "PROJECTS & RESEARCH"],
    "careerHetic.png": ["IEEE COMPUTER SOC.", "EVENTS HEAD"],
    "careerUzik.png": ["QUADRANT", "CLOUD AI INTERN"],
    "careerImmersiveGarden.png": ["ETHNUS", "FULL-STACK INTERN"],
    "careerOnlineTeacher.png": ["GEORGE MASON", "MS COMPUTER SCIENCE", "2025 - 2027"],
    "careerIRLTeacher.png": ["VIT", "B.TECH CSE", "2021 - 2025"],
}

PROJECTS_DATA = [
    {
        "files": ["thrill-1.png", "thrill-2.png", "thrill-3.png"],
        "titles": [
            "Thrill — Invoice Intelligence",
            "98% extraction accuracy",
            "Airflow NLP pipelines",
        ],
        "subtitle": "AI contract and invoice intelligence. PDF ingestion, LLM extraction, mismatch detection.",
        "tags": ["Python", "TensorFlow", "Airflow", "Azure"],
        "accent": (255, 128, 57),
    },
    {
        "files": ["recs-1.png", "recs-2.png", "recs-3.png"],
        "titles": [
            "Recommendation System",
            "SVD · KMeans · RFM",
            "FastAPI + React dashboard",
        ],
        "subtitle": "Multi-model recommendations with segmentation, association rules, and inventory insights.",
        "tags": ["Python", "FastAPI", "React", "Scikit-learn"],
        "accent": (83, 144, 255),
    },
    {
        "files": ["autism-1.png", "autism-2.png", "autism-3.png"],
        "titles": [
            "Autism Detection",
            "CNN / LSTM hybrid",
            "91% screening accuracy",
        ],
        "subtitle": "Deep learning screening on 1,500+ labeled samples with a Flask + MySQL backend.",
        "tags": ["TensorFlow", "CNN", "LSTM", "Flask"],
        "accent": (182, 95, 255),
    },
    {
        "files": ["loan-1.png", "loan-2.png", "loan-3.png"],
        "titles": [
            "Loan Default Prediction",
            "PyTorch + XGBoost",
            "SHAP / LIME explainability",
        ],
        "subtitle": "Ensemble default-risk models with an audit-ready Streamlit app for lending teams.",
        "tags": ["PyTorch", "XGBoost", "SHAP", "Streamlit"],
        "accent": (162, 255, 171),
    },
    {
        "files": ["parkinsons-1.png", "parkinsons-2.png", "parkinsons-3.png"],
        "titles": [
            "Parkinson's Prediction",
            "Springer 2024 research",
            "Random Forest + SVM",
        ],
        "subtitle": "Hybrid model at 88.7% accuracy on the UCI Parkinson's dataset for early-stage detection.",
        "tags": ["Scikit-learn", "Research", "SQL"],
        "accent": (255, 206, 202),
    },
    {
        "files": ["infant-1.png", "infant-2.png", "infant-3.png"],
        "titles": [
            "Infant Cry Analysis",
            "Audio ML pipeline",
            "Librosa + EfficientNet",
        ],
        "subtitle": "Classify infant cry patterns with signal processing and a Flask + MySQL web app.",
        "tags": ["Librosa", "Random Forest", "TensorFlow"],
        "accent": (83, 144, 255),
    },
    {
        "files": ["mazepay-1.png", "mazepay-2.png", "mazepay-3.png"],
        "titles": [
            "MazePay",
            "Full-stack payments",
            "MERN application",
        ],
        "subtitle": "Payments-style web app with React, Node, and MongoDB.",
        "tags": ["React", "Node.js", "MongoDB"],
        "accent": (255, 128, 57),
    },
    {
        "files": ["fxair-1.png", "fxair-2.png", "fxair-3.png"],
        "titles": [
            "FxAir",
            "Airline booking UI",
            "Front-end + APIs",
        ],
        "subtitle": "Flight booking experience with a custom front end and REST APIs.",
        "tags": ["JavaScript", "HTML", "CSS"],
        "accent": (182, 95, 255),
    },
]

LAB_DATA = [
    ("infant-cry.png", "Infant Cry Analysis", "Audio ML for cry classification", ["Librosa", "Flask"], (83, 144, 255)),
    ("autism.png", "Autism Detection", "CNN/LSTM medical screening", ["TensorFlow", "Flask"], (182, 95, 255)),
    ("parkinsons.png", "Parkinson's Prediction", "Springer 2024 hybrid model", ["RF", "SVM"], (255, 206, 202)),
    ("loan-default.png", "Loan Default", "Explainable risk scoring", ["PyTorch", "SHAP"], (162, 255, 171)),
    ("recs.png", "Recommendations", "SVD, clustering, RFM", ["FastAPI", "React"], (83, 144, 255)),
    ("mazepay.png", "MazePay", "MERN payments app", ["React", "MongoDB"], (255, 128, 57)),
    ("fxair.png", "FxAir", "Airline booking system", ["JavaScript"], (182, 95, 255)),
    ("survey.png", "Student Survey", "Full-stack survey app", ["Java", "Spring"], (83, 144, 255)),
    ("sql-writer.png", "AI SQL Writer", "Natural language to SQL", ["NLP", "Python"], (255, 128, 57)),
    ("adhd.png", "ADHD Research", "ML for ADHD screening", ["Python", "ML"], (162, 255, 171)),
]


def main():
    CAREER.mkdir(parents=True, exist_ok=True)
    PROJECTS.mkdir(parents=True, exist_ok=True)
    LAB.mkdir(parents=True, exist_ok=True)

    for name, lines in CAREER_LABELS.items():
        career_label(CAREER / name, lines, line_height=28 if len(lines) == 2 else 28)

    for project in PROJECTS_DATA:
        for filename, title in zip(project["files"], project["titles"]):
            project_card(
                PROJECTS / filename,
                title,
                project["subtitle"],
                project["tags"],
                project["accent"],
            )

    for name, title, subtitle, tags, accent in LAB_DATA:
        project_card(LAB / name, title, subtitle, tags, accent)
        mini = name.replace(".png", "-mini.png")
        project_card(LAB / mini, title, subtitle, tags, accent, mini=True)

    print("wrote career, project, and lab images")


if __name__ == "__main__":
    main()
