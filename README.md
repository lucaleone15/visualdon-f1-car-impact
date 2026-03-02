# 🏎️ F1 CAR IMPACT

## La voiture est-elle plus importante que le pilote en Formule 1 ?

---

## 📌 Contexte

En Formule 1, la performance est souvent attribuée soit au talent du pilote,
soit à la qualité de la voiture développée par l’équipe.

Dans le championnat du monde de Formule 1 (Formula One World Championship),
chaque écurie conçoit sa propre monoplace. Les différences de budget,
d’ingénierie et d’innovation technologique peuvent créer des écarts
importants de performance.

Mais alors :

👉 La victoire dépend-elle davantage du pilote ou de la voiture ?

Ce projet vise à explorer cette question à partir de données historiques.

---

## 🎯 Objectif

Analyser l’impact de la voiture (équipe) sur la performance d’un pilote.

Plus précisément :

- Comparer un pilote à son coéquipier (même voiture)
- Observer les performances d’un pilote avant et après un changement d’équipe
- Mesurer l’écart moyen entre coéquipiers
- Évaluer si certaines équipes amplifient les performances

---

## ❓ Questions de recherche

1. Un pilote domine-t-il systématiquement son coéquipier ?
2. Les performances d’un pilote changent-elles significativement après un transfert ?
3. L’écart entre deux coéquipiers est-il faible (voiture dominante) ou important (talent individuel) ?
4. Les équipes dominantes réduisent-elles l’impact du talent individuel ?

---

## 📊 Données

### Source

Les données proviennent de datasets publics F1 :

- Ergast API
- Kaggle F1 Dataset

### Format

Format principal : CSV

### Tables principales

- drivers.csv
- results.csv
- constructors.csv
- races.csv
- qualifying.csv

### Attributs utilisés

| Attribut      | Description              |
| ------------- | ------------------------ |
| driverId      | Identifiant du pilote    |
| constructorId | Identifiant de l’équipe  |
| grid          | Position de départ       |
| position      | Position finale          |
| points        | Points marqués           |
| year          | Saison                   |
| raceId        | Identifiant de la course |

---

## 🔍 Méthodologie

### 1️⃣ Comparaison intra-équipe

Comparer les pilotes d’une même équipe sur une saison :

- Moyenne des positions finales
- Total de points
- Écart moyen entre coéquipiers
- Ratio de victoires internes

Exemple d’analyse :
Comparer les performances d’un pilote avec son teammate sur une saison donnée.

---

### 2️⃣ Analyse avant / après transfert

Étudier les performances d’un pilote :

- Saison N dans équipe A
- Saison N+1 dans équipe B

Comparer :

- Moyenne des positions
- Points par course
- Taux de podiums

Objectif : mesurer l’impact du changement de voiture.

---

### 3️⃣ Mesure d’impact statistique

Créer des indicateurs :

- Écart moyen coéquipier
- Variation de points après changement d’équipe
- Performance relative à la moyenne de l’équipe

On peut utiliser :

- Moyennes
- Écart-type
- Corrélations

---

## 📈 Visualisations prévues

- Bar chart : comparaison points pilote vs coéquipier
- Scatter plot : points pilote vs points coéquipier
- Line chart : évolution performance avant/après transfert
- Heatmap : performance pilote × équipe

---

## 🧠 Hypothèses

H1 : L’écart entre coéquipiers est faible dans les équipes dominantes  
H2 : Un changement vers une meilleure équipe augmente significativement les points  
H3 : Les grands pilotes maintiennent un avantage même avec une voiture moyenne

---

## 🏁 Résultats attendus

Le projet permettra de :

- Quantifier l’impact de la voiture
- Visualiser l’importance relative du pilote
- Identifier les pilotes qui surperforment leur voiture
- Identifier les équipes qui masquent ou amplifient le talent

---

<!-- ## 📁 Structure du repository

f1-car-impact/
│
├── data/
├── notebooks/
├── visualizations/
├── src/
└── README.md

--- -->

## 🚀 Pourquoi ce projet est intéressant ?

- Sujet polémique et passionnant
- Données riches et exploitables
- Permet une vraie réflexion analytique

---

## 📌 Conclusion du projet

Ce projet ne cherche pas à donner une réponse absolue,
mais à explorer une tension fondamentale en Formule 1 :

🏎️ Machine ou humain ?

La réponse se situe probablement entre les deux —
et les données permettent de mieux comprendre cet équilibre.
