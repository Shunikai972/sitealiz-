# Pour toi, les beaux jours

Un site personnel pour une rentrée en médecine : lettres, poèmes, souvenirs, dix vidéos dans un carrousel 3D et une petite animation d’échecs.

## Aperçu local

Depuis la racine du dépôt :

```sh
python -m http.server 4173 --directory dist
```

Ouvrir http://localhost:4173. Aucun paquet à installer et aucune compilation nécessaire.

Les fichiers du site sont dans `dist/`. Les textes principaux sont dans `dist/index.html`, les poèmes dans `dist/assets/poems.js`. Les réglages de publication Sites sont dans `.openai/hosting.json`.

Le site prend en charge les petits écrans, la navigation au clavier et la préférence de réduction des animations. Les vidéos et la musique se lancent sur demande.
