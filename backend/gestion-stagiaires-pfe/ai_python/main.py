import json
import logging

from fastapi import FastAPI, File, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import io
import fitz
import mysql.connector
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from datetime import datetime
import spacy
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel

logger = logging.getLogger(__name__)
# Load pre-trained embedding model (lightweight but powerful)
model = SentenceTransformer('all-MiniLM-L6-v2')
nlp = spacy.load("fr_core_news_sm")

app = FastAPI()


# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LIMITE_PFE_JOURS = 85

# =========================
# ✅ DATABASE CONNECTION
# =========================

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="gestionStagaire"
    )

# =========================
# 🧠 AI LOGIC
# =========================
FRENCH_STOP_WORDS = list(nlp.Defaults.stop_words)

class RankingMetrics(BaseModel):
    task_score: float
    supervisor_score: float
    timing_score: float 
class InternshipRanking(BaseModel):
    stagiaire_id: int
    final_score: float
    rank: str
    metrics: RankingMetrics

def _calculate_timing_score(cursor, stagiaire_id: int) -> float:
    """
    Timing / punctuality score out of 20.
    - Zero late tasks          → 25  (bonus for perfect punctuality, capped to 20 later)
    - Minor delays (≤3 days)   → -1 each
    - Major delays (>3 days)   → -3 each
    Floor: 0
    """
    cursor.execute(
        """
        SELECT
            DATEDIFF(date_fin, deadline) AS days_late
        FROM tasks
        WHERE id_pfe = %s
          AND date_fin IS NOT NULL
          AND date_fin > deadline
        """,
        (stagiaire_id,),
    )
    late_tasks = cursor.fetchall()

    if not late_tasks:
        return min(25, 20 + 5)  # perfect-punctuality bonus, still capped at 20 by caller

    penalty = 0
    for row in late_tasks:
        days_late = row["days_late"] or 1
        penalty += 1 if days_late <= 3 else 3

    return max(0.0, 20.0 - penalty)



def clean_text_with_spacy(text):
    doc = nlp(text.lower())
    # Utilisation de lemma_ pour extraire la racine des mots (ex: "développant" -> "développer")
    return " ".join([token.lemma_ for token in doc if not token.is_stop and token.is_alpha])

def estimer_jours_tache(description: str):
    d = description.lower()
    jours = 5

    if any(x in d for x in ["api", "backend", "microservices"]):
        jours += 12
    if any(x in d for x in ["frontend", "angular", "interface"]):
        jours += 10
    if any(x in d for x in ["mobile", "flutter", "ios"]):
        jours += 15
    if any(x in d for x in ["ia", "machine learning", "gpt"]):
        jours += 20
    if any(x in d for x in ["auth", "securite", "jwt"]):
        jours += 8

    return jours

def analyze_cv_sections(text: str):
    text = text.lower()

    return {
        "has_internship": any(x in text for x in ["internship", "stage", "stagiaire"]),
        "has_project": any(x in text for x in ["project", "projet", "github"]),
        "has_experience": any(x in text for x in ["experience", "work", "employed"]),
        "has_degree": any(x in text for x in ["engineer", "licence", "master", "bachelor"]),
    }

def skill_match_score(cv_text: str, skills: list) -> float:
    """
    For dictionary skills → exact match bonus (1.0 if present).
    For unlisted skills  → sentence-level semantic similarity.
    """
    if not skills:
        return 0.0

    cv_lower = cv_text.lower()
    cv_chunks = [s.strip() for s in re.split(r'[\n.;]', cv_text) if len(s.strip()) > 10]
    chunk_embs = model.encode(cv_chunks) if cv_chunks else None

    scores = []
    for skill in skills:
        # ── Exact match for known tech skills (fastest + most accurate) ──
        if skill.lower() in TECH_SKILLS:
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            score = 1.0 if re.search(pattern, cv_lower) else 0.0

        # ── Semantic match for NLP-extracted skills ──
        elif chunk_embs is not None:
            skill_emb = model.encode([skill])[0]
            sims = cosine_similarity([skill_emb], chunk_embs)[0]
            score = float(sims.max())
        else:
            score = 0.0

        scores.append(score)

    return sum(scores) / len(scores)

def normalize_score(similarity: float) -> int:
    """
    Document-level SBERT similarities typically range 0.25–0.75.
    Map this range to 0–100.
    """
    low, high = 0.25, 0.75
    score = (similarity - low) / (high - low)
    score = max(0.0, min(score, 1.0))
    return int(score * 100)

SKILL_SEEDS = [
    "programming language", "software framework", "developer tool",
    "database", "cloud platform", "devops tool", "machine learning",
    "web technology", "operating system", "version control"
]


def basic_extraction(text: str):
    """Extract candidates preserving original case for proper nouns."""
    doc = nlp(text)  # ← remove .lower() here — keeps Python, React, etc.

    candidates = set()

    # Noun chunks (keep original case)
    for chunk in doc.noun_chunks:
        phrase = chunk.text.strip()
        phrase = re.sub(r"[^a-zA-Z0-9+#.\- ]", "", phrase)
        words = phrase.split()
        if 1 <= len(words) <= 3:
            candidates.add(phrase)

    # PROPN and NOUN tokens
    for token in doc:
        if token.pos_ in ["PROPN", "NOUN"] and len(token.text) > 2:
            candidates.add(token.text)

    # ── Also run on UPPERCASE version to catch acronyms (REST, SQL, API) ──
    for token in doc:
        if token.text.isupper() and len(token.text) >= 2:
            candidates.add(token.text)

    # Stopword filter
    stopwords = {
        "le", "la", "les", "des", "de", "du", "et", "ou",
        "pour", "dans", "avec", "que", "qui", "comme",
        "the", "and", "for", "with", "this", "that", "have",
        "from", "are", "our", "you", "your", "will", "has"
    }
    filtered = [
        p for p in candidates
        if not all(w.lower() in stopwords for w in p.split())
    ]

    return list(set(filtered))


def filter_real_skills(candidates, model, threshold=0.42):
    """Stricter filtering with more reference anchors."""
    if not candidates:
        return []

    # Pre-encode all references once (faster)
    reference_phrases = [
        "programming language like Python Java C++",
        "software framework like React Django Spring",
        "developer tool like Docker Git Kubernetes",
        "database like PostgreSQL MongoDB MySQL",
        "cloud platform like AWS Azure GCP",
        "machine learning library like TensorFlow PyTorch",
        "web technology like REST API GraphQL",
    ]
    ref_embs = model.encode(reference_phrases)

    valid = []
    candidate_embs = model.encode(candidates)  # batch encode — much faster

    for i, emb in enumerate(candidate_embs):
        sims = cosine_similarity([emb], ref_embs)[0]
        if sims.max() > threshold:
            valid.append(candidates[i])

    return valid



# ─── TECH DICTIONARY (always matched directly) ──────────────────────────────

TECH_SKILLS = {
    # Languages
    "python", "java", "javascript", "typescript", "php", "c++", "c#", "ruby",
    "swift", "kotlin", "go", "rust", "scala", "r", "matlab", "bash",

    # Frontend
    "react", "angular", "vue", "vue.js", "react.js", "next.js", "nuxt",
    "html", "css", "sass", "tailwind", "bootstrap", "jquery", "webpack",

    # Backend
    "laravel", "django", "flask", "fastapi", "spring", "express", "node.js",
    "nodejs", "symfony", "rails", "asp.net", "nestjs", "strapi",

    # Databases
    "mysql", "postgresql", "mongodb", "redis", "sqlite", "mariadb",
    "oracle", "cassandra", "elasticsearch", "firebase",

    # DevOps / Cloud
    "docker", "kubernetes", "git", "github", "gitlab", "jenkins", "nginx",
    "aws", "azure", "gcp", "linux", "terraform", "ansible", "ci/cd",

    # ML / Data
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "opencv", "huggingface", "langchain", "spark", "hadoop",

    # Concepts / Methods
    "rest", "api", "graphql", "microservices", "agile", "scrum",
    "mvc", "oop", "solid", "jwt", "oauth", "websocket",
}

def extract_dict_skills(text: str) -> list:
    """
    Fast O(n) scan — finds any TECH_SKILLS term in the text.
    Handles: 'Laravel', 'laravel', 'LARAVEL', 'node.js', 'Node.JS'
    """
    found = set()
    text_lower = text.lower()

    for skill in TECH_SKILLS:
        # Use word boundary to avoid 'java' matching 'javascript'
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill)

    return list(found)


# ─── UPDATED MAIN EXTRACTOR ─────────────────────────────────────────────────

def extract_skills(text: str) -> list:
    """
    Hybrid: dictionary lookup (precise) + semantic NLP (catches unlisted skills)
    """
    # 1. Fast dictionary match — never misses Laravel, Angular, etc.
    dict_skills = extract_dict_skills(text)

    # 2. Semantic NLP — catches domain-specific or unlisted skills
    nlp_candidates = basic_extraction(text)
    nlp_skills = filter_real_skills(nlp_candidates, model, threshold=0.42)

    # 3. Merge, deduplicate (normalize to lowercase for dedup)
    all_skills = dict_skills[:]
    dict_lower = {s.lower() for s in dict_skills}

    for s in nlp_skills:
        if s.lower() not in dict_lower:
            all_skills.append(s)

    return list(set(all_skills))

def calculate_final_score(cv_text: str, description: str):

    # 1. Semantic similarity (document level)
    cv_emb  = model.encode([cv_text])[0]
    job_emb = model.encode([description])[0]
    similarity    = cosine_similarity([cv_emb], [job_emb])[0][0]
    semantic_score = normalize_score(similarity)

    # 2. Skill match (sentence-level, job skills only)
    job_skills  = extract_skills(description)
    skill_raw   = skill_match_score(cv_text, job_skills)  # 0.0–1.0
    skill_score = normalize_score(skill_raw)              # reuse same curve

    # 3. Experience / section bonuses (unchanged)
    sections = analyze_cv_sections(cv_text)
    experience_score = (
        30 * sections["has_internship"] +
        20 * sections["has_project"]    +
        30 * sections["has_experience"] +
        20 * sections["has_degree"]
    )

    # 4. Weighted final  (skills weighted highest)
    final_score = (
        skill_score      * 0.50 +
        experience_score * 0.25 +
        semantic_score   * 0.25
    )

    return int(min(final_score, 100)), job_skills

# =========================
# 🚀 ROUTES
# =========================



from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

@app.post("/filtrer-cv")
async def filtrer_cv(
    file: UploadFile = File(...), 
    description_poste: str = Form(...),
    id_stagiaire: str = Form(...),
    id_projet: str = Form(...)
):
    db = get_db_connection() # On ouvre la connexion tôt pour les recommandations
    try:
        def clean_id(value: str) -> int:
            return int(float(value.replace('NaN', '0')))

        id_s = clean_id(id_stagiaire)
        id_p = clean_id(id_projet)

        content = await file.read()
        cv_text = ""
        doc = fitz.open(stream=content, filetype="pdf")
        cv_text = "\n".join(page.get_text("text") or "" for page in doc)
        doc.close()

        if not cv_text.strip():
            raise ValueError("CV is empty or unreadable")

        # ✅ IA Scoring actuel
        score, matched_keywords = calculate_final_score(
            cv_text=cv_text,
            description=description_poste
        )

        # ✅ Verdict logic
        if score >= 75:
            verdict = "VALIDE"
        elif score >= 40:
            verdict = "MOYEN"
        else:
            verdict = "REFUSE"

        # 🚀 NOUVEAU : Logique de Recommandation si REFUSE
        recommandation = None
        if verdict == "REFUSE":
            cursor_rec = db.cursor(dictionary=True)
            # On récupère les autres projets
            cursor_rec.execute("SELECT id_projet, titre, description FROM projet WHERE id_projet != %s", (id_p,))
            autres_projets = cursor_rec.fetchall()

            if autres_projets:
                textes = [cv_text] + [p['description'] for p in autres_projets]
                
                # Utilise 'french' si tes descriptions sont en français
                vectorizer = TfidfVectorizer(stop_words=FRENCH_STOP_WORDS)
                tfidf_matrix = vectorizer.fit_transform(textes)
                
                scores_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
                
                best_idx = scores_sim.argsort()[-1]
                best_score = float(scores_sim[best_idx])

                # DEBUG : Vérifie ces valeurs dans ton terminal Python
                print(f"Meilleur score trouvé ailleurs : {best_score}")

                # Baisse le seuil à 0.05 pour le test
                if best_score > 0.05: 
                    recommandation = {
                        "id_projet": autres_projets[best_idx]['id_projet'],
                        "titre": autres_projets[best_idx]['titre'],
                        "score_match": round(best_score * 100, 1)
                    }
            cursor_rec.close()

        # ✅ Database save
        cursor = db.cursor()
        sql = """
            INSERT INTO cv 
            (id_stagiaire, id_projet, nom_fichier, score_ia, date_analyse, statut, contenu_extrait)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (id_s, id_p, file.filename, score, datetime.now(), verdict, json.dumps(matched_keywords))
        
        cursor.execute(sql, values)
        db.commit()
        cursor.close()

        return {
            "status": "success",
            "score": score,
            "verdict": verdict,
            "matched_keywords": matched_keywords,
            "recommandation": recommandation # Retourne le projet idéal si refusé
        }

    except Exception as e:
        return {"status": "error", "message": f"Erreur : {str(e)}"}
    finally:
        db.close()
@app.post("/analyser-taches-suivi")
async def analyser_taches_suivi(id_pfe: int = Form(...), jours_ecoules: int = Form(...)):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT priorite, statut FROM tasks WHERE id_pfe = %s", (id_pfe,))
        taches = cursor.fetchall()
        
        if not taches:
            return {"pourcentage_ia": 0, "analyse": "Aucune tâche assignée."}

        # 1. On définit la valeur numérique de chaque priorité
        poids_map = {
            'HAUTE': 5,
            'MOYENNE': 3,
            'BASSE': 1
        }

        # 2. Calcul du total des poids (on convertit le texte en nombre ici)
        total_poids = sum(poids_map.get(t['priorite'], 1) for t in taches)
        
        # 3. Calcul du poids accompli
        poids_termine = sum(
            poids_map.get(t['priorite'], 1) 
            for t in taches if t['statut'] == 'TERMINE'
        )
        
        # Bonus : On peut donner 50% du poids si la tâche est "EN_COURS"
        poids_en_cours = sum(
            poids_map.get(t['priorite'], 1) * 0.5 
            for t in taches if t['statut'] == 'EN_COURS'
        )

        # 4. Calcul du pourcentage final
        avance_reelle = ((poids_termine + poids_en_cours) / total_poids) * 100
        
        # 5. Comparaison IA
        theorie = jours_ecoules * 1.2
        ecart = avance_reelle - theorie

        if ecart < -15:
            msg = "🚨 Retard critique : les tâches prioritaires stagnent."
        elif ecart > 5:
            msg = "⭐ Progression excellente par rapport aux objectifs."
        else:
            msg = "✅ Le rythme de validation des tâches est conforme aux attentes."

        return {
            "pourcentage_ia": round(avance_reelle, 1),
            "analyse": msg
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        cursor.close()
        db.close()

@app.post("/estimer-nouvelle-tache")
async def estimer_nouvelle_tache(description: str = Form(...), consomme: int = Form(...)):
    estimation = estimer_jours_tache(description)
    total = consomme + estimation
    faisable = total <= LIMITE_PFE_JOURS

    return {
        "estimation": estimation,
        "total": total,
        "faisable": faisable,
        "marge": LIMITE_PFE_JOURS - total,
        "verdict": "✅ FAISABLE" if faisable else "⚠️ SURCHARGE"
    }


@app.post("/chatbot-expert")
async def chatbot_expert(question: str = Form(...)):
    q = f" {question.lower()} " # On ajoute des espaces pour faciliter la détection des mots exacts
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        # --- 1. RECHERCHE PAR COMPÉTENCE TECHNIQUE (Priorité 1) ---
        tech_trouvee = next((tech for tech in TECH_SKILLS if f" {tech} " in q), None)

        if tech_trouvee:
            # Note : Suppression de contenu_extrait car la colonne n'existe pas chez toi
            cursor.execute("""
                SELECT u.nom, u.prenom, c.score_ia
                FROM cv c
                JOIN utilisateur u ON c.id_stagiaire = u.id_utilisateur
                WHERE c.contenu_extrait LIKE %s
                ORDER BY c.score_ia DESC
            """, (f"%{tech_trouvee}%",))
            
            candidats = cursor.fetchall()
            if candidats:
                top_3 = ", ".join([f"{c['prenom']} {c['nom']} ({c['score_ia']}%)" for c in candidats[:3]])
                return {"reponse": f"💻 Pour **{tech_trouvee.upper()}**, j'ai trouvé : {top_3}"}
            else:
                return {"reponse": f"🔍 Je reconnais la technologie {tech_trouvee.upper()}, mais aucun fichier ne porte ce nom en base."}

        # --- 2. RECHERCHE DU MEILLEUR SCORE (Priorité 2) ---
        if any(x in q for x in ["meilleur", "recommande", "top", "choisir"]):
            cursor.execute("""
                SELECT u.nom, u.prenom, c.score_ia 
                FROM cv c
                JOIN utilisateur u ON c.id_stagiaire = u.id_utilisateur
                WHERE c.score_ia IS NOT NULL
                ORDER BY c.score_ia DESC LIMIT 1
            """)
            top = cursor.fetchone()
            if top:
                return {"reponse": f"🎯 Le profil le plus pertinent est **{top['prenom']} {top['nom']}** avec un score de **{top['score_ia']}%**."}
            return {"reponse": "Désolé, aucun score IA n'est disponible pour le moment."}

        # --- 3. STATISTIQUES (Priorité 3) ---
        if "moyenne" in q:
            cursor.execute("SELECT AVG(score_ia) as moy FROM cv")
            res = cursor.fetchone()
            moyenne = round(res['moy'] or 0, 2)
            return {"reponse": f"📊 La moyenne générale des scores IA est de **{moyenne}%**."}

        # --- 4. ALERTES (Priorité 4) ---
        if any(x in q for x in ["faible", "mauvais", "insuffisant"]):
            cursor.execute("SELECT COUNT(*) as nb FROM cv WHERE score_ia < 40")
            res = cursor.fetchone()
            return {"reponse": f"⚠ Attention, **{res['nb']}** candidats ont un score inférieur à 40%."}

        # --- 5. RÉPONSE PAR DÉFAUT ---
        return {
            "reponse": "Bonjour ! Je peux vous aider à filtrer les stagiaires par technologie (ex: Angular), identifier le meilleur candidat ou voir les moyennes de performance. Que souhaitez-vous savoir ?"
        }

    except Exception as e:
        print(f"🔥 Erreur Chatbot : {e}")
        return {"reponse": "Une erreur technique est survenue lors de la consultation de la base de données."}
    
    finally:
        # Fermeture propre pour éviter les erreurs "No result set"
        cursor.close()
        db.close()



@app.get("/rankings/all", response_model=list[InternshipRanking])
async def get_all_rankings():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute("SELECT DISTINCT id_pfe FROM tasks")
        stagiaire_ids = [row["id_pfe"] for row in cursor.fetchall()]

        rankings = []
        for sid in stagiaire_ids:
            try:
                # Reuse the same scoring logic
                cursor.execute("SELECT status FROM tasks WHERE id_pfe = %s", (sid,))
                tasks = cursor.fetchall()
                if not tasks:
                    continue

                total = len(tasks)
                done        = sum(1 for t in tasks if t["status"] == "DONE")
                in_progress = sum(1 for t in tasks if t["status"] == "IN_PROGRESS")
                task_score  = ((done + 0.5 * in_progress) / total) * 40

                cursor.execute("SELECT pourcantage_avancement FROM suivi_pfe WHERE id_pfe = %s", (sid,))
                evaluation = cursor.fetchone()
                if evaluation is None:
                    supervisor_score = 20.0
                else:
                    supervisor_score = min((evaluation["pourcantage_avancement"] / 10) * 40, 40)

                timing_score = min(_calculate_timing_score(cursor, sid), 20)
                final_score  = task_score + supervisor_score + timing_score

                if   final_score >= 90: rank = "S+"
                elif final_score >= 80: rank = "S"
                elif final_score >= 70: rank = "A"
                elif final_score >= 55: rank = "B"
                elif final_score >= 40: rank = "C"
                else:                   rank = "D"

                rankings.append({
                    "id_pfe": sid,
                    "final_score": round(final_score, 2),
                    "rank": rank,
                    "metrics": {
                        "task_score":            round(task_score, 2),
                        "supervisor_score":       round(supervisor_score, 2),
                        "timing_score":           round(timing_score, 2),
                        "tasks_total":            total,
                        "tasks_done":             done,
                        "tasks_in_progress":      in_progress,
                        "evaluation_submitted":   evaluation is not None,
                    }
                })
            except Exception as e:
                logger.warning("Skipping id_pfe=%s: %s", sid, e)
                continue

        # Sort best → worst
        rankings.sort(key=lambda r: r["final_score"], reverse=True)
        return rankings

    finally:
        cursor.close()
        db.close()  

