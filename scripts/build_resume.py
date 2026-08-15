from fpdf import FPDF
from pathlib import Path

OUT = Path("/Users/shaikmohammadfardeen/Downloads/Mohammad Fardeen_Resume_AIEngineer.pdf")
PORT_COPY = Path("/Users/shaikmohammadfardeen/Desktop/port/static/resume/Mohammad Fardeen_Resume_AIEngineer.pdf")

LINKEDIN = "https://www.linkedin.com/in/shaikmofardeen/"
GITHUB = "https://github.com/smfardeen7"
PORTFOLIO = "https://fardeen.bio/"
EMAIL = "shaikfardeen595@gmail.com"
PHONE = "571-386-9025"


class Resume(FPDF):
    def __init__(self):
        super().__init__(format="Letter", unit="in")
        self.set_auto_page_break(auto=False, margin=0.45)
        self.set_margins(0.55, 0.42, 0.55)
        self.add_page()

    def section(self, title):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(20, 20, 20)
        self.cell(0, 0.22, title.upper(), new_x="LMARGIN", new_y="NEXT")
        y = self.get_y()
        self.set_draw_color(20, 20, 20)
        self.set_line_width(0.012)
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.ln(0.06)

    def job_head(self, left, right):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(20, 20, 20)
        self.cell(5.6, 0.18, left)
        self.set_font("Helvetica", "", 9.5)
        self.cell(0, 0.18, right, align="R", new_x="LMARGIN", new_y="NEXT")

    def italic_line(self, text):
        self.set_font("Helvetica", "I", 9.5)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 0.16, text)
        self.ln(0.02)

    def bullets(self, items):
        self.set_font("Helvetica", "", 9.4)
        self.set_text_color(30, 30, 30)
        for item in items:
            x = self.l_margin
            self.set_x(x)
            self.cell(0.14, 0.155, "-")
            self.multi_cell(self.w - self.r_margin - x - 0.14, 0.155, item)
        self.ln(0.05)


def build():
    pdf = Resume()
    usable = pdf.w - pdf.l_margin - pdf.r_margin

    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(15, 15, 15)
    pdf.cell(0, 0.32, "Shaik Mohammad Fardeen", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 9.2)
    pdf.set_text_color(35, 35, 35)
    y = pdf.get_y()
    parts = [
        (PHONE, f"tel:+1{PHONE.replace('-', '')}"),
        (" | ", None),
        (EMAIL, f"mailto:{EMAIL}"),
        (" | ", None),
        ("LinkedIn", LINKEDIN),
        (" | ", None),
        ("GitHub", GITHUB),
        (" | ", None),
        ("Portfolio", PORTFOLIO),
        (" | Fairfax, VA", None),
    ]
    widths = []
    for text, _ in parts:
        pdf.set_font("Helvetica", "U" if _ else "", 9.2)
        widths.append(pdf.get_string_width(text))
    total = sum(widths)
    x = (pdf.w - total) / 2
    for (text, link), w in zip(parts, widths):
        pdf.set_xy(x, y)
        pdf.set_font("Helvetica", "U" if link else "", 9.2)
        pdf.set_text_color(20, 70, 140) if link else pdf.set_text_color(35, 35, 35)
        pdf.cell(w, 0.2, text, link=link or "")
        x += w
    pdf.set_y(y + 0.24)

    pdf.set_font("Helvetica", "B", 11.5)
    pdf.set_text_color(15, 15, 15)
    pdf.cell(0, 0.24, "AI ENGINEER", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(0.04)

    pdf.section("Education")
    pdf.job_head("George Mason University, College of Engineering", "Aug 2025 - May 2027")
    pdf.italic_line("M.S. Computer Science")
    pdf.set_font("Helvetica", "", 9.2)
    pdf.multi_cell(
        0,
        0.15,
        "Coursework: Intro to Artificial Intelligence, Software Engineering for WWW, Component-Based Software Development, Analysis of Algorithms, Computer Systems and System Programming, Mathematical Foundations of CS, Database Systems, Mobile Immersive Computing, Modern Computer Architecture",
    )
    pdf.ln(0.06)
    pdf.job_head("Vellore Institute of Technology", "Sept 2021 - May 2025")
    pdf.italic_line("B.Tech. Computer Science and Engineering")
    pdf.set_font("Helvetica", "", 9.2)
    pdf.multi_cell(
        0,
        0.15,
        "Coursework: Data Structures & Algorithms, Object-Oriented Programming, Database Systems, Software Engineering, AI & ML",
    )
    pdf.ln(0.04)

    pdf.section("Technical Skills")
    pdf.set_font("Helvetica", "", 9.3)
    skills = [
        ("Languages: ", "Python, JavaScript, Java, SQL, R, HTML, CSS"),
        ("Tools: ", "TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy, Matplotlib, Jupyter, FastAPI, Azure OpenAI"),
        ("Core Areas: ", "Machine Learning, Deep Learning, Neural Networks, NLP, Computer Vision, Statistics, Data Analysis, Feature Engineering"),
    ]
    for label, value in skills:
        pdf.set_font("Helvetica", "B", 9.3)
        pdf.write(0.16, label)
        pdf.set_font("Helvetica", "", 9.3)
        pdf.write(0.16, value)
        pdf.ln(0.16)
    pdf.ln(0.04)

    pdf.section("Professional Experience")
    pdf.job_head("Quadrant Technologies  |  Cloud AI Intern  |  Redmond, WA", "Jun 2026 - Aug 2026")
    pdf.bullets(
        [
            "Developed an explainable candidate ranking system using semantic search and LLMs with adjustable scoring weights across resumes; implemented a blind-review mode showing exactly where each skill matched, ensuring full transparency and trust in AI decisions.",
            "Built a Screening Assistant with React, FastAPI, and Azure to automate resume parsing; leveraged Azure AI Document Intelligence and Azure OpenAI for intelligent extraction, cutting recruiter manual screening time significantly.",
        ]
    )
    pdf.job_head("Ethnus Codemithra  |  Full-Stack Developer Intern", "Aug 2023 - Nov 2023")
    pdf.bullets(
        [
            "Enhanced UI/UX by refactoring reusable React components and optimizing state management, increasing user engagement 15%; added Jest/React Testing Library coverage and Postman API monitoring, reaching 80% test coverage.",
        ]
    )

    pdf.section("Projects")
    pdf.job_head("AI Contract Invoice Intelligence System  |  Python, TensorFlow, Apache Airflow, Azure", "Nov 2025")
    pdf.bullets(
        [
            "Built scalable NLP pipelines with Python and TensorFlow to extract and enrich invoice data from unstructured PDFs; processed 150,000+ invoices annually at 98% accuracy, verified through quarterly QA audits.",
            "Engineered Apache Airflow DAG orchestration for ingestion, text extraction, validation, and storage; automated validation and error detection reduced data-quality issues by 60%.",
        ]
    )
    pdf.job_head("Personalized Recommendation System  |  Python, FastAPI, React, Scikit-Learn", "Oct 2025")
    pdf.bullets(
        [
            "Engineered a multi-model recommendation platform using SVD/matrix factorization, KMeans clustering, and RFM segmentation, with popularity baselining to measure personalization uplift.",
            "Built a versioned FastAPI backend for recommendations, segmentation, and association rules, plus a React dashboard for model outputs, customer insights, and inventory intelligence.",
        ]
    )
    pdf.job_head("Loan Default Prediction  |  PyTorch, XGBoost, SHAP/LIME, Streamlit", "Feb 2026")
    pdf.bullets(
        [
            "Developed an ensemble of PyTorch neural nets and XGBoost to predict loan defaults, with feature engineering, hyperparameter tuning, and cross-validation.",
            "Deployed a Streamlit app with SHAP and LIME so banking teams can explain predictions and keep an audit trail for lending decisions.",
        ]
    )
    pdf.job_head("Autism Detection  |  Python, TensorFlow, CNN/LSTM, Flask, MySQL", "Apr 2026")
    pdf.bullets(
        [
            "Designed a CNN/LSTM hybrid for autism spectrum screening and raised baseline accuracy 15% to 91% with learning-rate scheduling and class-weight balancing.",
            "Built an end-to-end pipeline on 1,500+ labeled medical samples and a Flask + MySQL backend for patient data and model inference.",
        ]
    )

    pdf.section("Research")
    pdf.job_head("Hybrid Algorithm for Parkinson's Prediction  |  Python, Scikit-Learn, SQL", "Nov 2025")
    pdf.bullets(
        [
            "Presented a hybrid Random Forest + SVM model at Springer 2024, reaching 88.7% accuracy on the UCI Parkinson's dataset (195 instances) - a 6-8% gain over individual models - by optimizing sensitivity and specificity for early-stage detection.",
        ]
    )

    pdf.section("Leadership")
    pdf.set_font("Helvetica", "", 9.4)
    pdf.set_text_color(30, 30, 30)
    pdf.multi_cell(
        0,
        0.155,
        "IEEE Computer Society - Events Head (Mar 2022 - Dec 2024): Led large-scale technical events and hackathons with participation exceeding 700 students.",
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    PORT_COPY.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    pdf.output(str(PORT_COPY))
    print("wrote", OUT)
    print("wrote", PORT_COPY)
    print("pages", pdf.pages_count)


if __name__ == "__main__":
    build()
