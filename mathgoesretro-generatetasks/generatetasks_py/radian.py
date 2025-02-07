import sympy as sp
import random
import json

# Grad -> Bogenmaß Frage generieren
def generate_degree_radian_question(idNr, diff):
    if (diff == 1):
        allowed_degrees = [22.5 * i for i in range(1, 17)]  # Erlaubte Gradwerte von 22.5 bis 360
        degree_value = random.choice(allowed_degrees)

    if (diff == 2):
        allowed_degrees = [11.25 * i for i in range(1, 33)]  # Erlaubte Gradwerte von 22.5 bis 360
        degree_value = random.choice(allowed_degrees)

    if (diff == 3):
        allowed_degrees = [5.625 * i for i in range(1, 65)]  # Erlaubte Gradwerte von 22.5 bis 360
        degree_value = random.choice(allowed_degrees)

    # Bogenmaß berechnen
    radian_value = sp.Rational(degree_value, 180) * sp.pi

    # Gradwert formatieren: Wenn Ganzzahl, als Ganzzahl formatieren, sonst mit einer Dezimalstelle
    if degree_value % 1 == 0:
        degree_display = f"{int(degree_value)}"  # Ganzzahl ohne .0
    else:
        degree_display = f"{degree_value:.1f}"  # Mit einer Dezimalstelle

    # Formuliere die Frage
    question = f"\\text{{Which radian measure corresponds to the degree measure }}{degree_display}^\\circ\\text{{ ?}}"

    # Generiere falsche Antworten und formatiere sie
    wrong_answers = []
    while len(wrong_answers) < 3:
        wrong_degree = random.choice(allowed_degrees)  # Erlaubte, aber falsche Werte
        wrong_radian = sp.Rational(wrong_degree, 180) * sp.pi
        # Formatieren der falschen Antworten als Bogenmaß
        wrong_radian_display = sp.latex(wrong_radian)
        if wrong_radian != radian_value and wrong_radian_display not in wrong_answers:
            wrong_answers.append(f"{wrong_radian_display}")

    # Antworten formatieren: Richtige Antwort an letzter Stelle
    answers = wrong_answers
    answers.append(f"{sp.latex(radian_value)}")  # Richtige Antwort an letzter Stelle

    # JSON-kompatibles Format mit den gewünschten Schlüsseln
    output = {
        "task_id": idNr,
        "question": question,
        "answer_stub": "",
        "wrong_answer1": answers[0],
        "wrong_answer2": answers[1],
        "wrong_answer3": answers[2],
        "correct_answer": answers[3],
        "topic": 'r',
        "difficulty": diff,
        "points": "",
        "status": 'n',
        "user_id": 3
    }

    return output


# Bogenmaß -> Grad Frage generieren
def generate_radian_degree_question(idNr, diff):
    if (diff == 1):
        allowed_degrees = [22.5 * i for i in range(1, 17)]  # Erlaubte Gradwerte von 22.5 bis 360
        degree_value = random.choice(allowed_degrees)

    if (diff == 2):
        allowed_degrees = [11.25 * i for i in range(1, 33)]  # Erlaubte Gradwerte von 22.5 bis 360
        degree_value = random.choice(allowed_degrees)

    if (diff == 3):
        allowed_degrees = [5.625 * i for i in range(1, 65)]  # Erlaubte Gradwerte von 22.5 bis 360
        degree_value = random.choice(allowed_degrees)

    # Bogenmaß erstellen
    radian_value = sp.Rational(degree_value, 180) * sp.pi

    # Gradwert formatieren: Wenn Ganzzahl, als Ganzzahl formatieren, sonst mit einer Dezimalstelle
    if degree_value % 1 == 0:
        degree_display = f"{int(degree_value)}^\\circ"  # Ganzzahl ohne .0, mit ^\circ
    else:
        degree_display = f"{degree_value:.1f}^\\circ"  # Mit einer Dezimalstelle, mit ^\circ

    # Formuliere die Frage
    question = f"\\text{{Which degree measure corresponds to the radian measure }}{sp.latex(radian_value)}\\text{{ ?}}"

    # Generiere falsche Antworten und formatiere sie
    wrong_answers = []
    while len(wrong_answers) < 3:
        wrong_degree = random.choice(allowed_degrees)
        # Formatieren der falschen Antworten als Grad mit ^\circ
        if wrong_degree % 1 == 0:
            wrong_degree_display = f"{int(wrong_degree)}^\\circ"  # Ganzzahl ohne .0, mit ^\circ
        else:
            wrong_degree_display = f"{wrong_degree:.1f}^\\circ"  # Mit einer Dezimalstelle, mit ^\circ
        if wrong_degree != degree_value and wrong_degree_display not in wrong_answers:
            wrong_answers.append(f"{wrong_degree_display}")

    # Antworten formatieren: Richtige Antwort an letzter Stelle
    answers = wrong_answers
    answers.append(f"{degree_display}")  # Richtige Antwort an letzter Stelle

    # JSON-kompatibles Format mit den gewünschten Schlüsseln
    output = {
        "task_id": idNr,
        "question": question,
        "answer_stub": "",
        "wrong_answer1": answers[0],
        "wrong_answer2": answers[1],
        "wrong_answer3": answers[2],
        "correct_answer": answers[3],
        "topic": 'r',
        "difficulty": diff,
        "points": "",
        "status": 'n',
        "user_id": 5
    }

    return output