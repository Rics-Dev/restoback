const Offre = require('../models/model_offregerant');
const { catchAsync, AppError, handleDBErrors } = require('./error');


exports.getalloffre = handleDBErrors(catchAsync(async(req,res,next) =>
{
    const offre = await Offre.findalloffre();

    if (!offre) {
        return next(new AppError('No offre found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            offre
        }
    });

}));


exports.addoffregerant = handleDBErrors(catchAsync(async (req, res, next) => {
    const { date_deb, date_fin, reduction } = req.body;

    if (!date_deb || !date_fin || !reduction) {
        return next(new AppError('Missing fields', 400));
    }

    const newOffre = await Offre.addoffre(date_deb, date_fin, reduction);
    
    if (!newOffre) {
        return next(new AppError('Offre not added', 400));
    }

    res.status(201).json({
        status: 'success',
        data: { offre: newOffre }
    });
}));

exports.addoffregerant_inplat = handleDBErrors(catchAsync(async(req,res,next)=>{
    const {id_offre, id_plat} = req.body;

    if (!id_offre || !id_plat) {
        return next(new AppError('Missing fields', 400));
    }

    const newOffre = await Offre.addoffre_inplat(id_offre, id_plat);
    

    if(!newOffre){
        return next(new AppError('Offre not added', 400));
    };

    res.status(201).json({
        status: 'success',
        data: {
            offre: newOffre
        }
    });
}));
