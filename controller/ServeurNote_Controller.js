const NoteServeurClient = require('../models/ServeurNote');
const { catchAsync, AppError,handleDBErrors } = require('./error');


exports.addServeurNote = handleDBErrors(catchAsync(async (req, res, next) => { 
    const {id_client, id_serveur, nb_etoile,avis} = req.body;
   
       if (!id_client || !id_serveur || !nb_etoile || !avis ) {
           return next(new AppError('Missing fields', 400));
       }
   
   
       
   
   
   
       const NoteServeur = await NoteServeurClient.addNoteServeur(id_client,nb_etoile,avis,id_serveur);
   
       if(!NoteServeur){
           return next(new AppError('ServeurNote not added', 400));
       };
   
       res.status(201).json({
           status: 'success',
           data: {
               NoteServeur :  NoteServeur
           }
       });
   
   
   }));
   


   exports.UpdateNotePlat = handleDBErrors(catchAsync(async (req, res, next) => {
    
    const { id_client,id_serveur,avis,nb_etoile } = req.body;

    if (!id_client || !id_serveur || !avis || !nb_etoile) {
        return next(new AppError('Missing fields', 400));
    }

    const NoteServeurMAJ = await NoteServeurClient.UpdateNoteServeur(id_client,id_serveur,nb_etoile,avis);
    if (!NoteServeurMAJ) {
        return next(new AppError('NoteServeurMAJ not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            NoteServeurMAJ
        }
    });
}));