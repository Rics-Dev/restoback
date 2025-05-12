const Reservation = require('../models/model_consultertableresrve');
const { catchAsync, AppError, handleDBErrors } = require('./error');




exports.getallreservation = handleDBErrors(catchAsync(async(req,res,next) =>{
    const reservation = await Reservation.findallreservation();

    if (!reservation) {
        return next(new AppError('No reservation found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            reservation
        }
    });
}));

exports.addreservation = handleDBErrors(catchAsync(async(req,res,next)=>{
    const {id_client, id_table, nb_personne, date_deb_res, date_fin_res} = req.body;


    if ( !id_client || !id_table || !nb_personne || !date_deb_res || !date_fin_res) {
        return next(new AppError('Missing fields', 400));
    }

    if (date_deb_res >= date_fin_res) {
        return next(new AppError('Start date must be before end date', 400)); 
        
    }

    const newReservation = await Reservation.addreservation(id_client, id_table, nb_personne, date_deb_res, date_fin_res);
    

    if(!newReservation){
        return next(new AppError('Reservation not added', 400));
    };

    res.status(201).json({
        status: 'success',
        data: {
            reservation: newReservation
        }
    });
}));

exports.findreservationbyclient = handleDBErrors(catchAsync(async(req,res,next) =>{
    const {id_client} = req.params;
    const reservation = await Reservation.findreservationbyclient(id_client);

    if (!reservation) {
        return next(new AppError('No reservation found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            reservation
        }
    });
}));

exports.deletereservationbyclient = handleDBErrors(catchAsync(async(req,res,next) =>{
    const {id_client} = req.params;
    const {id_reserv} = req.body;
    const reservation = await Reservation.deletereservationbyclient(id_client, id_reserv);

    if (!reservation) {
        return next(new AppError('No reservation found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
}));

exports.gettable = handleDBErrors(catchAsync(async(req,res,next) =>{
    const table = await Reservation.findtable();

    if (!table) {
        return next(new AppError('No table found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            table
        }
    });
}
));


