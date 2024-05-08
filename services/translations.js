function getAllTranslations(htmlData, scriptData){
    let translations = [];
    continuar = true;
    translations = searchHtmlTranslations(htmlData, translations);
    translations = searchScriptTranslations(scriptData, translations);
    let translations_copy = [];
    // Vamos a limpiar las traducciones que no están completas y estában ligadas a una variable
    // como por ejemplo "this.translate.instant('error.' + typeError)"
    for(i = 0; i < translations.length; i++){
        let palabra = translations[i];
        let seguir = true;
        // Buscamos hasta el ultimo punto y extraemos el string que queda
        while(seguir){
            let num = palabra.indexOf(".")
            if(num !== -1) palabra = palabra.substring(num+1, palabra.length);
            else seguir = false;
        }
        // Si luego del punto está vacío la descontamos(porque puede ser que
        // estuviera mezclado con una variable por ejemplo: "error." + typeError)
        // o si ya existía  también se descuenta
        if(palabra !== "" && !translations_copy.includes(translations[i])) translations_copy.push(translations[i]);
    }
    translations = translations_copy;
    return translations;
}

function searchHtmlTranslations(htmlData, translations){
    while(continuar){
        let num = htmlData.indexOf("{{");
        if(num !== -1){
            let string = htmlData.substring(num, htmlData.length);
            num = string.indexOf("}}");
            if(num !== -1){
                // Actualizamos el htmlData para la proxima busqueda que no encuentre el mismo
                htmlData = string.substring(num+2, string.length);
                string = string.substring(0, num);
                let buscar = '"';
                num = string.indexOf(buscar)
                // Si no encuentra nada cambiamos de un tipo de comillas a otra
                if(num === -1) { buscar = "'"; num = string.indexOf(buscar);}
                if(num !== -1){
                    // Acortamos de '{{"hola" | translate}}' a 'hola" | translate' y procedemos a cojer solo hasta las comillas
                    // y quedaría al final como "hola"
                    string = string.substring(num+1, string.length-2)
                    num = string.indexOf(buscar)
                    translations.push(string.substring(0,num));
                }
            } else continuar = false;
        } else continuar = false;
    }
    return translations;
}

function searchScriptTranslations(scriptData, translations){
    const palabra = ".instant(";
    let continuar = true;
    while(continuar){
        let num = scriptData.indexOf(palabra);
        if(num !== -1){
            let string = scriptData.substring(num, scriptData.length);
            num = string.indexOf(")");
            if(num !== -1){
                // Actualizamos el scriptData para la proxima busqueda que no encuentre el mismo
                scriptData = string.substring(num+palabra.length, string.length);
                string = string.substring(0, num);
                let buscar = '"';
                num = string.indexOf(buscar)
                // Si no encuentra nada cambiamos de un tipo de comillas a otra
                if(num === -1) { buscar = "'"; num = string.indexOf(buscar);}
                if(num !== -1){
                    // Acortamos de '.instant("spinner.login"' a 'spinner.login"'
                    string = string.substring(num+1, string.length);
                    num = string.indexOf(buscar);
                    translations.push(string.substring(0, num));
                }
            } else continuar = false;
        } else continuar = false;
    }
    return translations;
}

module.exports = { getAllTranslations};