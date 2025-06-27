const fs = require('node:fs/promises');

const readline = require('node:readline');
const { stdin: input, stdout: output, exit } = require('node:process');

const rl = readline.createInterface({ input, output });

class Tasks {
    constructor(){
        this.filepath = './tasks.json'
    }

    async file(text){
        if(text){
            try {
                await fs.rm(this.filepath);
                await fs.writeFile(this.filepath, text, 'utf8');
            } catch (error) {
                console.log(error)
            }
            return
        }

        try {
            await fs.open(this.filepath)
        } catch (error) {
            await fs.appendFile(this.filepath, '[]')
        }
    }

    /**
     * @param {string} status - (optional) Search tasks marked in <done, todo, in-progress>.
    */

    async list(status){
        console.clear()

        await this.file()
        try{
            const txt = await fs.readFile(this.filepath,'utf8')
            const json = JSON.parse(txt)

            if (status){
                const res = json.filter(obj => obj.status === status)
                for (let task of res){
                    console.log(task)
                }
                if(res.length < 1) console.log("N possui tarefas")
            }
            else {
                if(json.length < 1) console.log("N possui tarefas")
                else{
                    for (let task of json){
                        console.log(task)
                    }
                }
            }
        } catch (error) {
            console.log(error)
        }
        /*rl.question('Deseja retornar ou encerrar? [R/E]', (answer) => {
            if(answer.toUpperCase() === 'R') Main()
            else if(answer.toUpperCase() === 'E') exit(1)
            else console.log('Opcao desconhecida')
        })*/
    }
    /**
     * @param {string} description - A short description of the task.
    */
    async add(description){
        console.clear()

        await this.file()
        try{
            const txt = await fs.readFile(this.filepath, 'utf8');
            const obj = JSON.parse(txt);
            //console.log(json)

            obj.push({
                "id": obj.length === 0 ? 1 : obj.length + 1,
                "description": description,
                "status": "in-progress",
                "createAt": new Date().toLocaleString(),
                "updateAt": new Date().toLocaleString()
            });

            const json = JSON.stringify(obj);
            await this.file(json)

            const id = obj[obj.length-1].id
            console.log(`Sucesso ao adicionar a tarefa (ID: ${id})`)

        }catch (error){
            console.log(error)
        }
    }

    /**
     * @param {number} id - Task ID to update the task.
     * @param {string} description - A short description of the task.
    */
    async update(id, description){
        console.clear()

        await this.file()
        try {
            const txt = await fs.readFile(this.filepath, 'utf8');
            const obj = JSON.parse(txt);

            let indexToUpd;

            for(let x = 0; x < obj.length; x++){
                if(obj[x].id === id) {
                    indexToUpd = x
                    break
                }
            };

            obj[indexToUpd].description = description;

            const json = JSON.stringify(obj);
            await this.file(json);

            console.log(`A tarefa foi atualizada com sucesso (ID: ${id})`)
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * @param {number} id - Task ID to mark the task. 
     * @param {string} status - Mark the task within <done, todo, in-progress>
    */
    async mark(id, status){
        console.clear()

        await this.file()
        try {
            const txt = await fs.readFile(this.filepath, 'utf8');
            const obj = JSON.parse(txt);

            let indexToMark;

            for(let x = 0; x < obj.length; x++){
                if(obj[x].id === id) {
                    indexToMark = x
                    break
                }
            };

            obj[indexToMark].status = status;

            const json = JSON.stringify(obj);
            await this.file(json);

            console.log(`A tarefa foi marcada com sucesso (ID: ${id})`)
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * @param {number} id - Task ID to delete the task
    */
    async delete(id){
        console.clear()

        await this.file()
        try {
            const txt = await fs.readFile(this.filepath, 'utf8');
            const obj = JSON.parse(txt);

            const newObj = obj.filter(e => e.id !== id)

            const json = JSON.stringify(newObj);
            await this.file(json);

            console.log(`A tarefa foi deletada com sucesso (ID: ${id})`)
        } catch (error) {
            console.log(error)
        }
    }
}

function Main(){
    const tasks = new Tasks()
    console.log(`----- Task Tracker CLI -----\n`)
    rl.question('', async(answer) => {
        const command = answer.split(" ")[0]

        if (command === 'list'){
            const parameter = [answer.split(" ")[1]]
            if(parameter[0] === undefined){
                tasks.list()
            }
            else if (parameter[0] === 'done' || parameter[0] === 'todo' || parameter[0] === 'in-progress'){
                tasks.list(parameter[0])
            }
            else console.log("Parametro Inexistente")
        }
        else if(command === 'add'){
            const rawParameters = answer.split(" ")
            const parameter = [rawParameters.entries()].filter((element => element.key !== 0))
            if(parameter !== undefined) tasks.add(parameter[0])
            else console.log("Falta de parametro")
        }
        else if(command === 'update'){
            const parameter = [
                Number(answer.split(" ")[1]),
                answer.split(" ")[2]
            ]
            if(isNaN(parameter[0])) {
                console.log("O parametro id precisa ser um número.")
                return
            }

            tasks.update(parameter[0], parameter[1])
        }
        else if(command === 'mark'){
            const parameter = [
                Number(answer.split(" ")[1]),
                answer.split(" ")[2]
            ]
            if(isNaN(parameter[0])) {
                console.log("O parametro id precisa ser um número.")
                return
            }
            
            tasks.mark(parameter[0], parameter[1])
        }
        else if(command === 'delete'){
            const parameter = [answer.split(" ")[1]]
            tasks.delete(parameter[0])
        }
        else {
            console.log("Comando desconhecido...")

            rl.question('Deseja voltar ao programa? [S/N]', (answer) => {
                const res = answer.toUpperCase()

                if(res === 'S') Main()
                else exit(1)

                rl.close()
            })
        }
    rl.close();
    });
}

Main()