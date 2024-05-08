const fs = require("node:fs");
const _path = require('path');

function searchAllComponents(path, extensions, comparator){
    try{
        const files = fs.readdirSync(path);
        files.forEach(file => {
            const full_path = _path.join(path, file);
            if (fs.statSync(full_path).isDirectory()) {
                // Si es un directorio seguimos buscando
                searchAllComponents(full_path, extensions, comparator);
            } else {
                // Si no es un directorio y termina con alguna de las extensiones significa
                // que hemos encontrado un archivo que nos sirve
                if (extensions.some(extension => full_path.endsWith(extension))) {
                    let num = full_path.indexOf("component.");
                    let string = full_path.substring(0, num + "component.".length);
                    // Si no existía ya, se añade el componente sin la parte final de "component.ts" o "component.html"
                    if (!comparator.components.includes(string)) comparator.components.push(string);
                }
            }
        });
    } catch(error){
        return comparator;
    }

    return comparator;
}

function readAllFiles(comparator, jsonData, htmlData, scriptData, component){
    comparator, jsonData = readFile(comparator, comparator.jsonPath, "Exception -> JSON not found:"); // Leemos el JSON
    if(comparator.valid) comparator, htmlData = readFile(comparator, `${component}html`, "Exception -> HTML not found:"); // Leemos el HTML si el JSON se pudo leer bien
    if(comparator.valid) comparator, scriptData = readFile(comparator, `${component}ts`, "Exception -> TypeScript not found:"); // Leemos el TypeScript si el HTML se pudo leer bien
    if(!comparator.valid && jsonData !== undefined && htmlData !== undefined){
        // Si no encuentra el TypeScript probamos a buscarlo como JavaScript
        console.log("TypeScript not found.\nTrying to find component with JavaScript...");
        comparator, scriptData = readFile(comparator, `${comparator.component}js`, "Exception -> JavaScript not found:");
        if(comparator.valid) comparator.scriptType = "js"; // Si no se pudo leer el TypeScript pero si un JavaScript se cambia el tipo de script leido
    };

    return { comparator: comparator, jsonData: jsonData, htmlData: htmlData, scriptData: scriptData };
}

function readFile(comparator, path, exception){
    let data;
    try {
        data = fs.readFileSync(path, 'utf8') || null;
        comparator.valid = true;
    } catch (err) {
        console.log(`${exception} ${path}\n\t${err}`);
        comparator.valid = false;
    }
    return comparator, data
}

module.exports = { readAllFiles, searchAllComponents};