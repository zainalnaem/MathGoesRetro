import random
import sympy as sp
import json


def generate_derivative_question(idNr, diff):
    # Zufällige Werte für Funktion und Parameter generieren
    global func
    base_function = random.choice(["sin", "cos", "e"])  # Wähle eine Basisfunktion
    coefficient = 1
    exponent = 1
    variable = sp.symbols('x')  # Definiere die Variable
    derivative = 1

    if (diff == 1):
        coefficient = random.randint(-5, 5)  # Zufallskoeffizient für den Exponenten oder Faktor
        while coefficient == 0:
            coefficient = random.randint(-5, 5)

        exponent = random.randint(2, 5)  # Exponent für x

        # Erstelle die Funktion
        if base_function == "e":
            func = sp.exp(coefficient * variable ** exponent)
        elif base_function == "sin":
            func = sp.sin(coefficient * variable ** exponent)
        elif base_function == "cos":
            func = sp.cos(coefficient * variable ** exponent)

        # Berechne die Ableitung
        derivative = sp.diff(func, variable)

    if (diff >= 2):
        coefficient = random.choice(list(range(-10, -5)) + list(range(6, 11)))  # Zufallskoeffizient für den Exponenten oder Faktor
        while coefficient == 0:
            coefficient = random.choice(list(range(-10, -5)) + list(range(6, 11)))

        exponent = random.randint(2, 5)  # Exponent für x

        # Erstelle die Funktion
        if base_function == "e":
            func = sp.exp(coefficient * variable ** exponent)
        elif base_function == "sin":
            func = sp.sin(coefficient * variable ** exponent)
        elif base_function == "cos":
            func = sp.cos(coefficient * variable ** exponent)

        # Berechne die Ableitung
        derivative = sp.diff(func, variable)

        if (diff == 3):
            derivative = sp.diff(derivative, variable)

    correct_answer = sp.simplify(derivative)

    # Generiere falsche Antworten (keine Nullfaktoren, manipuliert falls nötig)
    wrong_answers = []
    wrong_coeff = 1
    wrong_exponent = 1
    for i in range(3):

        if (i == 0):
            # Zufällige Manipulation des Koeffizienten und Exponenten
            wrong_coeff = random.choice([coefficient - 1, coefficient + 1])
            wrong_exponent = random.choice([exponent - 1, exponent + 1])

            # Manipuliere den Faktor, falls er 0 wird
            while wrong_coeff == 0:
                wrong_coeff = random.choice([coefficient - 1, coefficient + 1])

            while wrong_exponent == 0:
                wrong_exponent = random.choice([coefficient - 1, coefficient + 1])

        if (i == 1):
            # Zufällige Manipulation des Koeffizienten und Exponenten
            wrong_coeff = random.choice([coefficient - 2, coefficient + 2])
            wrong_exponent = random.choice([exponent - 2, exponent + 2])

            # Manipuliere den Faktor, falls er 0 wird
            while wrong_coeff == 0:
                wrong_coeff = random.choice([coefficient - 2, coefficient + 2])

            while wrong_exponent == 0:
                wrong_exponent = random.choice([coefficient - 2, coefficient + 2])

        if (i == 2):
            # Zufällige Manipulation des Koeffizienten und Exponenten
            wrong_coeff = random.choice([coefficient - 3, coefficient + 3])
            wrong_exponent = random.choice([exponent - 3, exponent + 3])

            # Manipuliere den Faktor, falls er 0 wird
            while wrong_coeff == 0:
                wrong_coeff = random.choice([coefficient - 3, coefficient + 3])

            while wrong_exponent == 0:
                wrong_exponent = random.choice([coefficient - 3, coefficient + 3])

        # Erstellen der falschen Antwort
        if base_function == "e":
            wrong_func = f"{wrong_coeff}x \\cdot e^{{{wrong_exponent}x^2}}"
        else:
            wrong_func = f"{wrong_coeff}x \\cdot {base_function}({wrong_exponent}x^2)"
        wrong_answers.append(wrong_func)

    # Formatieren der Frage und der richtigen Antwort mit \left und \right
    question = f"\\text{{We have the following function f(x) = }} {sp.latex(func)}"
    answer_stub = f"\\text{{What is}} f'(x)?"

    if (diff == 3):
        answer_stub = f"\\text{{What is}} f''(x)?"

    # LaTeX für die korrekte Antwort erzeugen (mit automatisch eingefügten \left und \right)
    correct_answer_latex = sp.latex(correct_answer)

    # Entfernen von Leerzeichen vor Vorzeichen und Faktor in der richtigen Antwort
    correct_answer_latex = correct_answer_latex.replace(" -", "-").replace("- ", "-")

    # Entfernen von Leerzeichen vor dem x
    correct_answer_latex = correct_answer_latex.replace(" x", "x")

    answers = [f"{ans}" for ans in wrong_answers]  # Falsche Antworten
    answers.insert(3, f"{correct_answer_latex}")  # Richtige Antwort an vierter Stelle

    # JSON-kompatibles Format mit den gewünschten Schlüsseln
    output = {
        "task_id": idNr,
        "question": question,
        "answer_stub": answer_stub,
        "wrong_answer1": answers[0],
        "wrong_answer2": answers[1],
        "wrong_answer3": answers[2],
        "correct_answer": answers[3],
        "topic": 'd',
        "difficulty": diff,
        "points": "",
        "status": 'n',
        "user_id": 4
    }

    return output