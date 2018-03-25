const readline = require('readline');
const model = require('./model');
const {log, biglog, errorlog, colorize} = require("./out");
const cmds = require("./cmds");

const net = require("net");
net.createServer(socket=>{
  console.log("Se ha conectado un cliente desde " + socket.remoteAddress);
/*console.log(
  chalk.green.bold( 
    figlet.textSync('Core Quiz', {horizontalLayout: 'full'})
    )
  );*/

biglog(socket, 'Core Quiz','green');


const rl = readline.createInterface({
  input: socket,
  output: socket,
  prompt:colorize("quiz >",'blue'),
  completer : (line) =>{
  const completions = 'h help show add delete edit list test p play credits q quit'.split(' ');
  const hits = completions.filter((c) => c.startsWith(line));
  // show all completions if none found
  return [hits.length ? hits : completions, line];
}
});

socket
.on("end",()=> {rl.close();})
.on("error",()=> {rl.close();})

rl.prompt();

rl.
on('line',(line) => {


  let args = line.split(" ");
  let cmd = args[0].toLowerCase().trim();


  switch (cmd) {
    case '':
    rl.prompt();
    break;
    
    case 'h':
    case 'help':
    /* console.log("Comandos!");
      console.log("h/help - muestra ayuda");
      console.log("list - listar los quizzes existentes");
      console.log("show <id> - muestra la pregunta y la respuesta el quiz indicado por el id");
      console.log("add - añadir un nuevo quiz interactivamente");
      console.log("delete <id> - borra el quiz indicado");
      console.log("edir <id> - editar el quiz indicado");
      console.log("test <id> - probar el quiz indicado");
      console.log("p/play - jugar con preguntasaleatorias de todos los quizes");
      console.log("credits - creditos");
      console.log("q/quit - salir del programa");*/
      cmds.helpCmd(socket, rl);
      break;

    case 'quit':
    case 'q':
    /*rl.close();*/
     cmds.quitCmd(socket, rl);
    break;

    case 'add':
    /*console.log('añadir un nuevo quiz');*/
     cmds.addCmd(socket, rl);
    break;

    case 'list':
    /*console.log('listar todos los quiezes');*/
     cmds.listCmd(socket, rl);
    break;

    case 'show':
    /*console.log('mostrar el quiz indicado');*/
    cmds.showCmd(socket, rl,args[1]);
    break;

    case 'test':
    /*console.log('probar quiz indicado');*/
     cmds.testCmd(socket, rl,args[1]);
    break;

    case 'play':
    case 'p':
    /*console.log('jugar');*/
     cmds.playCmd(socket, rl);
    break;

    case 'delete':
    /*console.log('borrar el quiz indicado');*/
    cmds.deleteCmd(socket, rl,args[1]);
    break;

    case 'edit':
    /*console.log('editar el quiz indicado');*/
     cmds.editCmd(socket, rl,args[1]);
    break;

    case 'credits':
    /*console.log('autores de la practica');
    console.log('nombre 1');
    console.log('nombre 2');*/
     cmds.creditsCmd(socket, rl);
    break;

    default:
 console.log(socket, `Say what? I might have heard '${colorize(cmd,'red')}'`);
    console.log(socket, `use'${colorize('help','green')}' para ver todos los comandos`);
   rl.prompt();
    break;
}

  
}).on('close', () => {
  log(socket, 'adios');
  //process.exit(0);
});


})
.listen(3030);


