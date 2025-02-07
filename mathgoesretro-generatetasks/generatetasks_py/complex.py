import sympy as sp
import random
import json

def generate_simple_complex_question(idNr, diff):
    # Symbole und Zufallswerte definieren
    i = sp.I  # Komplexe imaginäre Einheit i
    factor = 1
    real_part = 1
    imag_part = 1

    if (diff == 1):
        factor = random.randint(-10, 11)  # Zufälliger Faktor (k), jetzt auch negativ
        while factor == 0:
            factor = random.randint(-10, 11)

        real_part = random.randint(-10, 11)  # Realteil (a), jetzt auch negativ
        while real_part == 0:
            real_part = random.randint(-10, 11)

        imag_part = random.randint(-10, 11)  # Imaginärteil (b), jetzt auch negativ
        while imag_part == 0:
            imag_part = random.randint(-10, 11)

    if (diff == 2):
        factor = random.choice(list(range(-20, -10)) + list(range(11, 21)))  # Zufälliger Faktor (k), jetzt auch negativ
        while factor == 0:
            factor = random.choice(list(range(-20, -10)) + list(range(11, 21)))

        real_part = random.choice(list(range(-20, -10)) + list(range(11, 21)))  # Realteil (a), jetzt auch negativ
        while real_part == 0:
            real_part = random.choice(list(range(-20, -10)) + list(range(11, 21)))

        imag_part = random.choice(list(range(-20, -10)) + list(range(11, 21)))  # Imaginärteil (b), jetzt auch negativ
        while imag_part == 0:
            imag_part = random.choice(list(range(-20, -10)) + list(range(11, 21)))

    if (diff == 3):
        factor = random.choice(list(range(-50, -20)) + list(range(21, 51)))  # Zufälliger Faktor (k), jetzt auch negativ
        while factor == 0:
            factor = random.choice(list(range(-50, -20)) + list(range(21, 51)))

        real_part = random.choice(list(range(-50, -20)) + list(range(21, 51)))  # Realteil (a), jetzt auch negativ
        while real_part == 0:
            real_part = random.choice(list(range(-50, -20)) + list(range(21, 51)))

        imag_part = random.choice(list(range(-50, -20)) + list(range(21, 51)))  # Imaginärteil (b), jetzt auch negativ
        while imag_part == 0:
            imag_part = random.choice(list(range(-50, -20)) + list(range(21, 51)))

    # Komplexe Zahl erstellen
    complex_num = real_part + imag_part * i
    z = (factor * i) * complex_num  # Multiplikation mit rein imaginärem Faktor

    # Berechnung des Imaginärteils
    imaginary_part = factor * real_part  # k * a
    correct_answer = imaginary_part

    # Generiere falsche Antworten
    wrong_answers = []
    while len(wrong_answers) < 3:
        wrong_imaginary = correct_answer + random.choice([-3, -2, -1, 1, 2, 3])
        if wrong_imaginary != correct_answer and wrong_imaginary not in wrong_answers:
            wrong_answers.append(wrong_imaginary)

    # Antworten formatieren: richtige Antwort an letzter Stelle
    answers = [f"{ans}" for ans in wrong_answers]
    answers.append(f"{correct_answer}")  # Richtige Antwort an letzter Stelle

    # Frage formulieren
    question = f"\\text{{What is the imaginary part of }}" \
               f"z = {sp.latex(factor)}i \\cdot ({sp.latex(complex_num)})?"

    # JSON-kompatibles Format mit den gewünschten Schlüsseln
    output = {
        "task_id": idNr,
        "question": question,
        "wrong_answer1": answers[0],
        "wrong_answer2": answers[1],
        "wrong_answer3": answers[2],
        "correct_answer": answers[3],
        "topic": 'c',
        "difficulty": diff,
        "points": "",
        "status": 'n',
        "user_id": 3
    }

    return output