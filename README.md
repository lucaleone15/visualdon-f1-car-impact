# 🏎️ F1 CAR IMPACT

## Dans quelle mesure la voiture impacte-t-elle les performances d’un pilote en Formule 1 ?

## 📌 Contexte

Ce projet s’appuie sur des données historiques issues du championnat du monde de Formule 1.

Les données proviennent principalement de :

- Ergast API : base de données publique compilant les résultats officiels des courses depuis 1950.
- Kaggle F1 Dataset : compilation structurée des résultats, qualifications, équipes et pilotes, basée sur des données officielles de la FIA.

### Qui a créé ces données et pourquoi ?

Les résultats bruts (positions, points, équipes) sont produits et validés par la Fédération Internationale de l’Automobile (FIA) dans un objectif réglementaire et sportif : officialiser les classements.

L’Ergast API a ensuite structuré ces résultats pour permettre leur réutilisation à des fins statistiques et analytiques.

Les données n’ont donc pas été collectées pour analyser l’impact de la voiture, mais pour documenter les résultats sportifs. Ce projet détourne ces données vers une question analytique : la part de la machine dans la performance humaine.

### Biais et limites

Plusieurs biais doivent être pris en compte :

- Les points marqués dépendent du système de points en vigueur (qui a évolué dans le temps).
- Les abandons (problèmes mécaniques) peuvent pénaliser artificiellement un pilote.
- Les stratégies d’équipe (consignes, priorités) ne sont pas visibles dans les données.
- Le contexte technique (règlement aérodynamique, budget cap, hybridation) varie fortement selon les époques.
- Les performances ne capturent pas des éléments invisibles comme la gestion des pneus, la défense ou la pression psychologique.

Ces absences font partie intégrante de la réflexion : les données racontent une partie de l’histoire, mais pas toute.

## 📊 Description des données

Les données sont structurées sous forme de fichiers CSV relationnels.

### Structure générale

Les principales tables utilisées :

- drivers.csv → informations pilotes
- constructors.csv → équipes
- races.csv → informations sur chaque course
- results.csv → résultats par pilote et par course
- qualifying.csv → positions de départ

### Attributs clés utilisés

| Attribut      | Type    | Description                  |
| ------------- | ------- | ---------------------------- |
| driverId      | Integer | Identifiant unique du pilote |
| constructorId | Integer | Identifiant de l’équipe      |
| grid          | Integer | Position de départ           |
| position      | Integer | Position finale              |
| points        | Float   | Points marqués               |
| year          | Integer | Saison                       |
| raceId        | Integer | Identifiant de la course     |

### Nature des données

- Données quantitatives (positions, points, écarts)
- Données catégorielles (équipe, pilote)
- Données longitudinales (évolution dans le temps)

Les données permettent des comparaisons intra-équipe et inter-saisons.

## 🎯 But

Ce projet combine deux approches :

### 1️⃣ Explorer

- Identifier des tendances dans l’écart entre coéquipiers
- Observer les variations de performance après un changement d’équipe
- Détecter des pilotes qui surperforment ou sous-performent leur voiture

### 2️⃣ Expliquer

L’objectif narratif est clair :

Mesurer l'impact de la voiture sur les performances du pilote.

L’histoire que ce projet souhaite raconter :

- Certains pilotes dominent systématiquement leurs coéquipiers → impact du talent.
- Certains pilotes explosent leurs performances après un transfert → impact de la voiture.
- Certaines équipes montrent des écarts faibles entre pilotes → voiture dominante.

Le regard porté sur ces données est analytique mais critique :  
les résultats sportifs sont une interaction entre technologie, stratégie et talent.

## 🔍 Méthodologie prévue

### Comparaison intra-équipe

- Moyenne des positions finales
- Total de points par saison
- Écart moyen entre coéquipiers
- Ratio de victoires internes

Objectif : isoler la variable "voiture" en comparant deux pilotes dans le même environnement technique.

### Analyse avant / après transfert

Comparer :

- Points par course avant changement d’équipe
- Points par course après transfert
- Variation moyenne de classement

Objectif : observer l’effet du changement de monoplace.

### Indicateurs statistiques

- Moyenne
- Écart-type
- Corrélation
- Écart relatif à la moyenne d’équipe

Une extension possible serait un modèle de régression pour estimer la contribution relative du constructeur et du pilote.

## 📈 Visualisations prévues

- Bar chart → comparaison pilote vs coéquipier
- Scatter plot → performance pilote vs performance équipe
- Line chart → évolution avant/après transfert

### Wireframe

Lien vers le wireframe : https://www.figma.com/design/CtcadGRihLOY82J6DKIoWF/VisualDon---Wireframes?node-id=0-1&t=JtOPZ7YNRoSSGoph-1

## 📚 Références

Plusieurs projets abordent des questions similaires :

- **F1 Dashboards** – plateforme de visualisations interactives pour explorer les données F1, notamment des comparaisons de performances pilotes, classements et statistiques historiques. https://f1dashboards.com/
- **F1 BigData** – base de données complète avec statistiques historiques et visualisations de l’évolution des classements pilotes et constructeurs au fil des saisons. https://www.bigdataf1.com/
- **F1 Dash (télémetry/visualisation open-source)** – dashboards interactifs basés sur les données de timing et télémétrie permettant d’analyser la performance technique des voitures et des pilotes. https://github.com/FraserTarbet/F1Dash
- **Formula-Telemetry** – plateforme interactive de visualisation de données de télémétrie (vitesse, RPM, secteurs, trajectoires) permettant d’analyser la performance technique des voitures en course. https://formula-telemetry.com

## 🏁 Conclusion

Ce projet ne cherche pas à désigner un vainqueur dans le débat :

🏎️ La voiture ou le pilote ?

Il cherche à quantifier une tension fondamentale du sport moderne :

La performance est-elle d’abord humaine, ou technologique ?

La Formule 1 est probablement l’un des rares sports où la machine
et l’humain sont aussi étroitement imbriqués.

Les données permettent d’approcher cette frontière.
