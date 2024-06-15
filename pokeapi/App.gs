function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function searchPokemon(userWeight, userName) {
  var sheet = SpreadsheetApp.openById('1jSKyWgpz4cBYeCempEhHFXhjM-wOE2RHZPgM2ZsbFPM').getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  var closestPokemons = data.slice(1) // remove header row
    .map(function(row) {
      return {
        id: row[0],
        name: row[1],
        weight: row[2],
        weightDifference: Math.abs(row[2] - userWeight)
      };
    })
    .sort(function(a, b) {
      return a.weightDifference - b.weightDifference;
    })
    .slice(0, 3);
  
  return {pokemons: closestPokemons, userName: userName};
}
