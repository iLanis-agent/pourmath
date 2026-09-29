// PourMath engine - cocktail dilution and strength math. Pure functions, no DOM.
(function (root) {
  'use strict';

  // Ingredients: [{name, ml, abv}] where abv is a fraction (0.40) or 0 for non-alcoholic.
  function totals(ingredients) {
    var vol = 0, alc = 0;
    ingredients.forEach(function (i) {
      if (i.ml < 0) throw new Error('negative ml for ' + i.name);
      vol += i.ml;
      alc += i.ml * (i.abv || 0);
    });
    return { volume: vol, alcohol: alc, abv: vol > 0 ? alc / vol : 0 };
  }

  // Dilution fractions by method (water added as fraction of pre-dilution volume).
  var DILUTION = { neat: 0.0, built: 0.10, stirred: 0.25, shaken: 0.30 };
  function dilutionFor(method) {
    if (!(method in DILUTION)) throw new Error('unknown method: ' + method);
    return DILUTION[method];
  }

  // After mixing: dilution adds water, alcohol stays constant.
  function afterMix(ingredients, method) {
    var t = totals(ingredients);
    var d = dilutionFor(method);
    var finalVol = t.volume * (1 + d);
    return {
      volume: finalVol,
      water: t.volume * d,
      alcohol: t.alcohol,
      abv: finalVol > 0 ? t.alcohol / finalVol : 0
    };
  }

  // US standard drink: 14g ethanol ~= 17.7 ml pure alcohol.
  function standardDrinks(alcoholMl) {
    return alcoholMl / 17.7;
  }

  function strengthBand(abv) {
    if (abv === 0) return 'zero-proof';
    if (abv < 0.08) return 'light - highball territory';
    if (abv < 0.15) return 'easy - spritz strength';
    if (abv < 0.25) return 'standard - classic sour strength';
    if (abv < 0.32) return 'stiff - martini neighborhood';
    return 'sipper - treat it like straight spirit';
  }

  // Balance check for sours: strong : sweet : sour. Classic is 2 : 0.75-1 : 0.75-1.
  function sourBalance(strongMl, sweetMl, sourMl) {
    if (strongMl <= 0) throw new Error('strong part must be positive');
    var s = sweetMl / strongMl, t = sourMl / strongMl;
    var notes = [];
    if (s < 0.3) notes.push('low on sweet - likely sharp');
    else if (s > 0.75) notes.push('heavy on sweet - likely cloying');
    else notes.push('sweet in range');
    if (t < 0.3) notes.push('low on sour - may taste flat');
    else if (t > 0.75) notes.push('heavy on sour - pucker warning');
    else notes.push('sour in range');
    if (Math.abs(s - t) > 0.4) notes.push('sweet and sour are far apart - the drink will lean');
    return { sweetRatio: s, sourRatio: t, notes: notes };
  }

  // Batch a spec to N servings. Returns per-ingredient totals and vessel volume (with dilution).
  function batch(ingredients, method, servings) {
    if (servings <= 0) throw new Error('servings must be positive');
    var per = afterMix(ingredients, method);
    var lines = ingredients.map(function (i) {
      return { name: i.name, ml: i.ml * servings };
    });
    var preVol = totals(ingredients).volume * servings;
    return {
      lines: lines,
      preDilutionMl: preVol,
      waterMl: per.water * servings,
      finalMl: per.volume * servings,
      abv: per.abv,
      standardDrinks: standardDrinks(per.alcohol * servings)
    };
  }

  var api = {
    totals: totals,
    dilutionFor: dilutionFor,
    afterMix: afterMix,
    standardDrinks: standardDrinks,
    strengthBand: strengthBand,
    sourBalance: sourBalance,
    batch: batch
  };
  root.PourMath = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
