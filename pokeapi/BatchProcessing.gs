function fetchAndWriteAllPokemonData() {
  Logger.log('fetchAndWriteAllPokemonData: 開始'); // デバッグログ

  const sheetId = 'あなたのスプレッドシートのIDを入れてください';
  const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
  sheet.clear(); // シートをクリア

  // ヘッダー行を設定
  const headers = ['ID', '名前', '体重（kg）'];
  sheet.appendRow(headers);

  const maxPokemonId = 1010; // 最大ポケモンIDを1010に設定
  const batchSize = 10; // 一度に処理するポケモンの数

  PropertiesService.getScriptProperties().setProperty('maxPokemonId', maxPokemonId.toString());
  PropertiesService.getScriptProperties().setProperty('batchSize', batchSize.toString());
  PropertiesService.getScriptProperties().setProperty('currentBatchStartId', '1');

  deleteTriggers(); // 既存のトリガーを削除

  ScriptApp.newTrigger('processBatch')
    .timeBased()
    .after(1000)
    .create();

  Logger.log('fetchAndWriteAllPokemonData: 終了'); // デバッグログ
}

function processBatch() {
  Logger.log('processBatch: 開始'); // デバッグログ

  const sheetId = 'あなたのスプレッドシートのIDを入れてください';
  const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();

  const maxPokemonId = parseInt(PropertiesService.getScriptProperties().getProperty('maxPokemonId'), 10);
  const batchSize = parseInt(PropertiesService.getScriptProperties().getProperty('batchSize'), 10);
  const currentBatchStartId = parseInt(PropertiesService.getScriptProperties().getProperty('currentBatchStartId'), 10);

  Logger.log(`processBatch: maxPokemonId=${maxPokemonId}, batchSize=${batchSize}, currentBatchStartId=${currentBatchStartId}`); // デバッグログ

  for (let id = currentBatchStartId; id < currentBatchStartId + batchSize && id <= maxPokemonId; id++) {
    try {
      const url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
      const response = UrlFetchApp.fetch(url);
      const pokemonDetails = JSON.parse(response.getContentText());

      // デバッグログ
      Logger.log(`Fetched data for Pokémon ID: ${id}`);
      Logger.log(pokemonDetails);

      const weight = pokemonDetails.weight / 10; // デカグラムをkgに変換

      // 日本語名を取得
      const speciesUrl = pokemonDetails.species.url;
      const speciesResponse = UrlFetchApp.fetch(speciesUrl);
      const speciesDetails = JSON.parse(speciesResponse.getContentText());
      const japaneseNameObj = speciesDetails.names.find(name => name.language.name === 'ja');
      const japaneseName = japaneseNameObj ? japaneseNameObj.name : pokemonDetails.name;

      // スプレッドシートにデータを追加
      sheet.appendRow([id, japaneseName, weight]);
      Logger.log(`Added Pokémon ID: ${id} - ${japaneseName} - ${weight} kg`);

    } catch (e) {
      Logger.log(`Error fetching data for Pokémon ID: ${id} - ${e.message}`);
    }
  }

  const newBatchStartId = currentBatchStartId + batchSize;
  if (newBatchStartId <= maxPokemonId) {
    PropertiesService.getScriptProperties().setProperty('currentBatchStartId', newBatchStartId.toString());
    deleteTriggers(); // 既存のトリガーを削除
    ScriptApp.newTrigger('processBatch')
      .timeBased()
      .after(600) 
      .create();
    Logger.log('Next batch scheduled.');
  } else {
    Logger.log('All Pokémon data fetch and write complete.');
  }

  Logger.log('processBatch: 終了'); // デバッグログ
}

function deleteTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}
