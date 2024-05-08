const { json, arrayBuffer } = require("stream/consumers");
const translate = require("./translations");
const fs = require("node:fs");

function createJsonFile(data, translations, json){
    let newTranslations = [];
    for(let i = 0; i < translations.length; i++){
        let collect = ""; // Aquí se concatena todas las keys para añadirlas en el txt si no existe
        let data_copy = data; // Es la variable que contiene el valor de las keys que contenga nuestro nuevo json
        let translation = translations[i].split('.') || translations[i]; // Dividimos el string para poder buscar en el json el valor "common.username" tal que: "['common']['username']"
        let position = json; // Esta variable indicará por que cabezera del json vamos
        for(let j = 0; j < translation.length; j++){
            if(data_copy[translation[j]] === undefined) j = translation.length; // Si una key del componente no se encuentra en el json no se continua añadiendolo
            else{
                collect += translation[j] + ".";
                if(position[translation[j]] === undefined && j !== translation.length-1) position[translation[j]] = {};
                else if(position[translation[j]] === undefined) position[translation[j]] = data_copy[translation[j]];
                position = position[translation[j]];
                data_copy = data_copy[translation[j]];
            }
        }
        collect = collect.substring(0,collect.length-1);
        if(collect !== "" && !newTranslations.includes(collect)) newTranslations.push(collect);
    }
    
    return {json: json,translations: newTranslations};
}

function indexKeys(obj, prefix = '', txt = '') {
    for (const key in obj) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            txt = indexKeys(obj[key], newPrefix, txt);
        } else {
            txt += `-->${newPrefix}\n`;
        }
    }
    return txt;
}

function createTxtFile(translations, jsonData) {
    let txt = "*******************************\n" +
        "*                             *\n" +
        "*       Keys no usadas        *\n" +
        "*                             *\n" +
        "*******************************\n";
    for (let i = 0; i < translations.length; i++) {
        let translation = translations[i].split('.') || translations[i];
        if (translation.length <= 1) {
            let key = jsonData[translation];
            // Si es una variable suelta no será un objeto por lo que lo imprimimos tal cual
            if (typeof key !== 'object') {
                delete jsonData[translation]
            }
        } else{
            let json = jsonData;
            for(let j = 0; j < translation.length; j++){
                json = json[translation[j]];
                if(j == translation.length-2){
                    delete json[translation[j+1]];
                    j = translation.length;
                }
            }
        }
    }
    return indexKeys(jsonData, '', txt);
}

function generateFiles(jsonData, htmlData, scriptData, json, translations){
    // Buscamos todas las traducciones existentes en el componente y luego creamos
    // el json con las traducciones encontradas en el componente y en el json recibido
    let translations2 = translate.getAllTranslations(htmlData, scriptData);
    let data = createJsonFile(jsonData, translations2, json);
    // Actualizamos las translations en caso de que haya alguna que no existiera
    for(let translation of data.translations){
        if(!translations.includes(translation)) translations.push(translation);
    }
    return {json: data.json, translations: translations};
}

function writeAllFiles(json, jsonData, translations, path){
    console.log("Creating new files...")
    const newJson = JSON.stringify(json, null, 4);
    if(newJson === "{}") console.log("Error -> The new JSON is empty.");
    else {
        fs.writeFileSync(path + "json", newJson);
        console.log("\t->JSON file have been created successfully in createdFiles field.");
        if(translations.length > 0){
            let txt = createTxtFile(translations, jsonData);
            fs.writeFileSync(path + "txt", txt);
            console.log("\t->TXT file have been created successfully in createdFiles field.");
        } else{
            console.log("\t->TXT file is empty, all translations have been used.")
        }
    }
}

module.exports = {createJsonFile, generateFiles, writeAllFiles}