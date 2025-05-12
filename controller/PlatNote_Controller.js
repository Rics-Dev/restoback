const NotePlatClient = require('../models/PlatNote');
const { catchAsync, AppError, handleDBErrors } = require('./error');


exports.addNotePlat = handleDBErrors(catchAsync(async (req, res, next) => { 
    const {id_client, id_plat, nb_etoile,avis} = req.body;
   
       if (!id_client || !id_plat || !nb_etoile || !avis ) {
           return next(new AppError('Missing fields', 400));
       }
   
   
       
   
   
   
       const NotePlat = await NotePlatClient.addNotePlat(id_client,nb_etoile,avis,id_plat);
   
       if(!NotePlat){
           return next(new AppError('PlatNote not added', 400));
       };
   
       res.status(201).json({
           status: 'success',
           data: {
               NotePlat : NotePlat
           }
       });
   
   
   }));
   


   exports.UpdateNotePlat = handleDBErrors(catchAsync(async (req, res, next) => {
    
    const { id_client,id_plat,avis,nb_etoile } = req.body;

    if (!id_client || !id_plat || !avis || !nb_etoile) {
        return next(new AppError('Missing fields', 400));
    }

    const NoteClientMAJ = await NotePlatClient.UpdateNotePlat(id_client,id_plat,nb_etoile,avis);
    if (!NoteClientMAJ) {
        return next(new AppError('NoteClientMAJ not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            NoteClientMAJ
        }
    });
}));
   