

const Sequelize = require('sequelize');
const {models} =require('./model');
const {log, biglog, errorlog, colorize} = require("./out");

exports.helpCmd= (socket, rl)=>{
       log(socket, 'Comandos:');
    log(socket, "h|help - Muestra esta ayuda.");
     log(socket, "list - Listar los quizzes existentes.");
     log(socket, "show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
     log(socket, "add - Añadir un nuevo quiz interactivamente.");
     log(socket, "delete <id> - Borrar el quiz indicado.");
     log(socket, "edit <id> - Editar el quiz indicado");
     log(socket, "test <id> - Probar el quiz indicado");
     log(socket, "p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
     log(socket, "credits - Créditos.");
    log(socket, "q|quiz - Salir del programa.");
      rl.prompt();
     };


    exports.quitCmd=(socket, rl)=>{
    
rl.close();
    rl.prompt();
	socket.end();
   };
 

    const makeQuestion = (rl, text) => {


        return new Sequelize.Promise((resolve, reject) => {

            rl.question(colorize(text, 'red'), answer =>{
        resolve(answer.trim());
});
});
};

    exports.addCmd=(socket, rl)=>{


        makeQuestion(rl, 'Introduzca una pregunta:')

        .then(q=> {

            return makeQuestion(rl, 'Introduzca la respuesta')

                .then(a => {

                    return {question : q, answer:a};

});

})

        .then(quiz => {
            return models.quiz.create(quiz);

})

        .then((quiz) =>{

log(socket, `${colorize('Se ha añadido','magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);

})
           .catch(Sequelize.ValidationError, error => {

            errorlog(socket, 'El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
})  

.catch(error => {
       errorlog(socket, error.message);
     })
    
    .then(()  => {   rl.prompt();

})
    };


  exports.listCmd=(socket, rl)=>{

    models.quiz.findAll()
    .each(quiz => {

            log(socket, `[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);

    })

    .catch(error => {

    errorlog(socket, error.message);

    })
    .then(() => {

        rl.prompt();
    });
   };


    const validateId = id => {

        return new Sequelize.Promise((resolve,reject) => {

            if (typeof id === "undefined"){
                
                reject(new Error(`Falta el parametro <id>.`));
	
		
            }
            else{

                id=parseInt(id);

                if(Number.isNaN(id)){
                    reject(new Error(`El valor del parametro <id> no es un número.`));
		

                }
                else {
                    resolve(id);
		

             
                }

            }
})

};

   exports.showCmd=(socket, rl,id)=>{

    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {

        if(!quiz){
            throw new Error(`No existe un quiz asociado al id = ${id}.`);

        }

        log(socket, `[${colorize(quiz.id, 'magenta')}]: ${quiz.question}${colorize('=>', red)}`)
    
    })
     
    .catch(error => {
       errorlog(socket, error.message);
     })
    
    .then(()  => {   rl.prompt();

})
    };
   
    exports.testCmd=(socket, rl,id)=>{
      
	
	
       validateId(id)
	
        .then(id => models.quiz.findById(id))

        
	
	.then(quiz => {
        if(!quiz){
        
            throw new Error(socket, `No existe un quiz asociado al id = ${id}.`);	

}

	
	
    return makeQuestion(rl, quiz.question)

        .then ( a =>{

        if (quiz.answer===a) {

            log(socket, "Su respuesta es correcta");
		return;
		

        }
        else{

            log(socket, "Su respuesta es incorrecta");
		return;
		}
		
	
               
        });

})


    .catch(error => {
       errorlog(socket, error.message);
	rl.prompt();
     })	

.then(()  => {   rl.prompt();

})
	
    };
   
   	/*exports.playCmd=rl=>{

     		let score = 0; 
  		let contador = 4; 
     		let toBeResolved=[]; 
      
     		    for (i=1; i<5; i++){ 
        
    			toBeResolved[i-1]=i; 
 
     		    } 
       
		    const play = () => { 

			return Promise.resolve()
			.then(() => {
       
				if(contador===0){ 
        
         			    log(`Fin del juego. \n Aciertos ${colorize(score,'magenta')} `); 

		  		   return;

    				} 
       				else{ 
          
         			    let idaux= Math.round(Math.random()*(toBeResolved.length -1));
         			    let id= toBeResolved[idaux];
	
         			    validateId(id)
       				    .then(id => models.quiz.findById(id))
        		            .then(quiz => {

					toBeResolved.splice(idaux,1);
    					contador --;    

    					return makeQuestion(rl, quiz.question)
    
        				.then ( a =>{

        					if (quiz.answer===a) {

             						score++; 
             						log(`Su respuesta es correcta. Aciertos ${colorize(score,'magenta')}`); 
                         				return play();

        					}
        					else{

             						log(`Fin del juego. Su respuesta es incorrecta. Aciertos ${colorize(score,'magenta')}`); 
               						return;
						}           
          				}); 
    				     })
    
       };  
	});

        };
models.quiz.findAll({raw: true})
.then(() => {

return play(); })
.catch(error => {
       errorlog(error.message);
	rl.prompt();
     })
    
    .then(()  => { 
    
    rl.prompt();

})

   };
*/

exports.playCmd = (socket, rl) => {
	let score = 0;
	let preguntas = [];

	const play = () => {

		return Promise.resolve()
		.then (() => {
			if (preguntas.length <= 0) {
				log(socket, "Fin del juego.");
				log(socket, "Ha obtenido " + score + " aciertos");
				return;
			}
			let pos = Math.round(Math.random()*(preguntas.length -1));
			let quiz = preguntas[pos];
			preguntas.splice(pos, 1);

			return makeQuestion(rl, quiz.question)
			.then(a => {
				if(a === quiz.answer) {
					score++;
					log(socket, "Su respusta es correcta");
					if (preguntas.length > 0){
					log(socket, "Lleva " + score + " aciertos");
					}		
					return play();

				} else {
					log(socket, "Su respusta es incorrecta");
					log(socket, "Fin del juego");
					log(socket, "Ha obtenido " + score + " aciertos");

				}
			})
		})
	}

	models.quiz.findAll({raw: true})
	.then(quizzes => {
		preguntas = quizzes;
	})
	.then(() => {
		return play();
	})
	.catch(er => {
		log(socket, "error: " + e);
	})
	.then(() => {
		log(socket, score);
		rl.prompt();
	})
};

   exports.deleteCmd=(socket, rl,id)=>{

    validateId(id)

    .then(id => models.quiz.destroy({where: {id}}))

    .catch(error => {
       errorlog(socket, error.message);
	rl.prompt();
     })
    
    .then(()  => { 
    
    rl.prompt();

})
    };


   exports.editCmd=(socket, rl,id)=>{


        validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
        if(!quiz){
            throw new Error(`No existe un quiz asociado al id = ${id}.`);

        }
    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);

    return makeQuestion(rl, 'Introduzca la pregunta:')
        
        .then (q => {
        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);

    return makeQuestion(rl, 'Introduzca la respuesta:')

       .then(a => {
            quiz.question =g;
            quiz.answer=a;
            return quiz;
});
});
})

    .then(quiz => {

        return quiz.save();
})

    .then(quiz => {

        log(socket, `Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
    
    })

    .catch(Sequelize.ValidationError, error => {
errorlog(socket, 'El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
})  

.catch(error => {
       errorlog(socket, error.message);
     })
    
    .then(()  => {   rl.prompt();

})

         };
    
    exports.creditsCmd=(socket, rl)=>{
  
   log(socket, 'nombre 1: Susana Coira');
   
    rl.prompt();
};
