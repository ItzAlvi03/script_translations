const { json } = require("stream/consumers");
const Comparator = require("./models/Comparator");
const reader = require("./services/read");
const writer = require("./services/write");

// Recogemos los argumentos pasados por comando
const args = process.argv.slice(2);
// Comprobamos si es valido(están todos los parametros) y si no es válido se imprime que falta
var comparator = new Comparator(args);
// Se imprimirán los datos si está todo correcto o las excepciones encontradas
if(!comparator.valid) comparator.exceptions();
else{
    // Imprimimos los datos que se han obtenido por consola
    comparator.toString();
    if(!comparator.jsonPath.endsWith("json")) console.log("El archivo no es un json");
    else{
        comparator = reader.searchAllComponents(comparator.component, ['component.html', 'component.ts', 'component.js'], comparator);
        let json = {};
        let translations = [];
        let jsonData = null;
        if(comparator.components.length > 0){
            comparator.components.forEach(component => {
                let htmlData = null;
                let scriptData = null;
                let data = reader.readAllFiles(comparator, jsonData, htmlData, scriptData, component);
                jsonData = data.jsonData;
                htmlData = data.htmlData;
                scriptData = data.scriptData;
                comparator = data.comparator;
                // Si terminó como valido significa que se pudo leer los 3 archivos necesario
                if(comparator.valid){
                    try{
                        jsonData = JSON.parse(jsonData);
                    }catch(error){
                        console.log("Exception -> The JSON file is not correct: " + component);
                        comparator.valid = false;
                    }
                    if(comparator.valid){
                        let data = writer.generateFiles(jsonData, htmlData, scriptData, json, translations);
                        json = data.json;
                        translations = data.translations;
                    }
                }
            });
            writer.writeAllFiles(json, jsonData, translations, './createdFiles/temp.');
        } else{
            console.log("Exception -> No components found in: " + comparator.component);
        }
    }
}