class Comparator {
    component;
    components = [];
    jsonPath;
    valid = true;
    exception = [];
    args = [];
    required = ["component", "file"];
    scriptType = "ts";

    constructor(args) {
        // Los parametros de pasan tal que 'file=C:/workspace/object.json component=login'
        // Luego se parsea separanto el simbolo '=' y obtenemos la key como parametro a buscar y value como su valor
        this.args = this.parseArgs(args);
        // Insertamos los datos si no son nulos y agremamos excepciones en caso de que haya
        if((this.args.component || null) !== null) this.component = this.args.component
        else this.exception[this.exception.length] = "component";
        if((this.args.file || null) !== null) this.jsonPath = this.args.file;
        else this.exception[this.exception.length] = "file";
        // Metodo que chequea los valores recibidos y si están todos los requeridos
        this.valid = this.checkValues();
    }

    parseArgs(args) {
        const newArgs = {};
        args.forEach(arg => {
            const [key, value] = arg.split('=');
            if (key && value) {
                if(!newArgs[key]) newArgs[key] = value; // Si no existe esa key se añade
            }
        });
        return newArgs;
    }

    checkValues(){
        let values = {};
        // Comprobamos que la key exista en los values del contructor, si es así se guarda su valor
        for (const key in this.args) {
            if (this.required.includes(key) && this.args[key] !== null && this.args[key] !== "") {
                values[key] = this.args[key];
            }
        }
        this.args = values;

        return Object.keys(this.args).length == this.required.length;
    }

    toString() {
        // Es la cabezera de el log
        let string ="\n\t*******************************\n\t" +
                    "*                             *\n\t" +
                    "*  Parametros de comparación  *\n\t" +
                    "*                             *\n\t" +
                    "*******************************\n";
        // Sobreescribimos el string con los parametros guardados
        for(const key in this.args) string += `\n--${key}: ${this.args[key]}`;
        // Imprimimos todo el log con la cabezera y parametros guardados
        console.log(string + "\n");
    }
    
    exceptions() {
        let string = "";
        // Si no es valido quiere decir que alguno de los parametros requeridos no está
        if (!this.valid) {
            string = "Exception -> required parameters: ";
            this.exception.forEach(element => {
                string += element + ", ";
            });
            // Cambiamos la ',' final por un '.'
            string = string.substring(0, string.length - 2) + ".";
            console.log(string);
        } else {
            console.log('No hay excepciones, todos los parámetros son correctos.');
        }
    }
}

module.exports = Comparator;