const ClientPlat = require('../models/PlatClient_model'); // Assurez-vous que le chemin est correct
const { catchAsync, AppError,handleDBErrors } = require('./error');
const client = require('../config/db');


exports.DonnerPlatsDisponible = handleDBErrors(catchAsync(async (req, res, next) => {
    const platsDispo = await ClientPlat.findAllPlatDisponible();
    // Assurez-vous que getAllplat est bien défini dans le module plat

    if (!platsDispo) {
        return next(new AppError('No plats found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            platsDispo
        }
    });
}));



exports.ConsulterUnPlatClient = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new AppError('Missing id', 400));
    }

    const platClient = await ClientPlat.ConsulterUnPlat(id);

    if (!platClient) {
        return next(new AppError('Plat not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            platClient
        }
    });
}));


exports.getPlatsPourClient = handleDBErrors(catchAsync(async (req, res, next) => {
    const now = new Date();
   

    const hour = now.getHours(); // Récupérer l'heure actuelle
  

    const getMomentByHour = (hour) => {
        if (hour >= 5 && hour < 11) return 'petit dej';
        if (hour >= 11 && hour < 15) return 'dejeuner';
        if (hour >= 19 && hour < 23) return 'dinner';
        return 'snack';
    };

    const moment = getMomentByHour(hour);
 

    const tendanceQuery = `
    SELECT * FROM connected_restaurant."Plat"
    WHERE note_plat >= 4
    ORDER BY note_plat DESC
    LIMIT 5;
`;

const momentQuery = `
    SELECT * FROM connected_restaurant."Plat"
    WHERE moment = $1
    ORDER BY RANDOM()
    LIMIT 5;
`;

const [platsTendance, platsMoment] = await Promise.all([
    client.query(tendanceQuery),
    client.query(momentQuery, [moment])
]);

const plats = [...platsTendance.rows, ...platsMoment.rows];

// Filtrer pour ne garder que les plats uniques par id_plat
const platsUniques = [];
const seenIds = new Set();

for (const plat of plats) {
    if (!seenIds.has(plat.id_plat)) {
        platsUniques.push(plat);
        seenIds.add(plat.id_plat);
    }
}

res.status(200).json({
    status: 'success',
    data: platsUniques
});
}
));