import json

from complex import generate_simple_complex_question
from derivative import generate_derivative_question
from radian import generate_radian_degree_question
from radian import generate_degree_radian_question

def main():
    # Parameters for number of questions and difficulty
    n_complex = 10
    n_derivative = 10
    n_degree_radian = 5
    n_radian_degree = 5

    # Counter for generated task_id
    idNr = 1

    # Generiere Komplexzahlenfragen
    complex_questions = []
    for i in range(1, 4):
        for j in range(n_complex):
            complex_questions.append(generate_simple_complex_question(idNr, i))
            idNr += 1

    # Generiere Ableitungsfragen
    derivative_questions = []
    for i in range(1, 4):
        for j in range(n_derivative):
            derivative_questions.append(generate_derivative_question(idNr, i))
            idNr += 1

    # Generiere Bogenmaß ↔ Grad Fragen
    radian_degree_questions = []
    for i in range(1, 4):
        for j in range(n_radian_degree):
            radian_degree_questions.append(generate_radian_degree_question(idNr, i))
            idNr += 1

    # Generiere Grad ↔ Bogenmaß Fragen
    degree_radian_questions = []
    for i in range(1, 4):
        for j in range(n_degree_radian):
            degree_radian_questions.append(generate_degree_radian_question(idNr, i))
            idNr += 1

    # Kombiniere alle Fragen
    all_questions = (
            complex_questions + derivative_questions + radian_degree_questions + degree_radian_questions
    )

    # JSON-Datei speichern
    filename = "all_combined_questions.json"
    with open(filename, "w", encoding="utf-8") as file:
        json.dump(all_questions, file, indent=4, ensure_ascii=False)  # Unicode-kompatibel

    print(f"Alle Fragen wurden erfolgreich in {filename} gespeichert.")

# Hauptprogramm ausführen
if __name__ == "__main__":
    main()