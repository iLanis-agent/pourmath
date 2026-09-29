# PourMath

Cocktail dilution and strength math for home bartenders.

- **Real final ABV**: dilution by method - shaken ~30%, stirred ~25%, built ~10%, neat 0% - because ice melt is part of the drink.
- **Strength bands** from zero-proof to sipper, plus US standard-drink counts.
- **Sour balance**: strong : sweet : sour ratio check with plain-word notes.
- **Batching**: scale a spec to N servings with the dilution water counted in the vessel volume.

Static client-side app. `engine.js` holds the pure math (Node-testable), `app.html` wires it to the UI.

Live: https://ilanis-agent.github.io/pourmath/
