const client = require('../config/db');
const { admin, db, fieldValue } = require('../config/firebase-admin');
const sendFCMNotification = require('../utils/sendFCMNootification');


const commande = {
    async findallcommande() {
        const result = await client.query('SELECT * FROM connected_restaurant.commande;');
        return result.rows;
    },
    async findcommandebyclient(id_client) {
        const result = await client.query('SELECT * FROM connected_restaurant.commande WHERE id_client = $1 AND "State_commande" = \'prête\';', [id_client]);
        return result.rows;
    },


    async _scheduleRatingNotification(id_commande, id_client, id_table) {
        try {
            const serveur = await client.query(
                `SELECT id_personnel FROM connected_restaurant."Personnel"
                 WHERE personnel_type = 'serveur' AND id_table_serveur = $1`,
                [id_table]
            );
    
            if (!serveur.rows[0]) {
                console.warn("Aucun serveur trouvé pour cette table");
                return;
            }
    
            const id_serveur = serveur.rows[0].id_personnel;
    
            const plats = await client.query(
                `SELECT pc.id_plat, p.nom_plat 
                 FROM connected_restaurant."Plat_commande" pc
                 JOIN connected_restaurant."Plat" p ON pc.id_plat = p.id_plat
                 WHERE pc.id_commande = $1`,
                [id_commande]
            );
    
            const platsData = plats.rows.map(p => ({ 
                id_plat: p.id_plat, 
                nom_plat: p.nom_plat
            }));
    
            const tokenSnapshot = await db.collection('fcm_tokens').doc(`client_${id_client}`).get();
    const clientDeviceToken = tokenSnapshot.exists ? tokenSnapshot.data().token : null;

    if (!clientDeviceToken) {
      console.warn(`⚠️ Aucun token trouvé pour client ${id_client}`);
    }

    const ratingNotification = {
      id_commande,
      id_client,
      id_serveur,
      plats: platsData,
      isRead: false,
      createdAt: fieldValue.serverTimestamp(),
      scheduledTime: new Date(Date.now() +  2 * 60 * 1000), // 4 heures
      status: 'pending',
      message: "Comment était votre expérience ?",
      clientDeviceToken, // ➡️ Ajoute ici
    };

    await db.collection('client_rating_notifications').add(ratingNotification);

    console.log('✅ Notification planifiée pour 4h plus tard.');

  } catch (error) {
    console.error("Erreur dans _scheduleRatingNotification:", error);
  }
},
    
    async createCommandeWithNotification(commandeData, plats) {
        if (!Array.isArray(plats)) {
            throw new Error('`plats` doit être un tableau');
        }
    
        try {
            // Démarrer une transaction
            await client.query('BEGIN');
    
            // Créer la commande (sans spécifier id_commande)
            const newCommande = await client.query(
                `INSERT INTO connected_restaurant.commande
                 (id_client, "State_commande", "Date_commande", mode_payment, id_table)
                 VALUES ($1, 'en_attente', NOW(), $2, $3)
                 RETURNING *`,
                [commandeData.id_client, commandeData.mode_payment, commandeData.id_table]
            );
    
            // Récupérer l'ID auto-généré
            const id_commande = newCommande.rows[0].id_commande;
    
            // Ajouter les plats à la commande et mettre à jour les ingrédients
            for (const plat of plats) {
                // Ajouter le plat à la commande
                await client.query(
                    `INSERT INTO connected_restaurant."Plat_commande"
                     (id_plat, id_commande, quantite) VALUES ($1, $2, $3)`,
                    [plat.id_plat, id_commande, plat.quantite]
                );
    
                // Récupérer les ingrédients du plat
                const ingredients = await client.query(
                    `SELECT id_ingredient, "quantité_in_plat" 
                     FROM connected_restaurant.ingredient_in_plat 
                     WHERE id_plat = $1`,
                    [plat.id_plat]
                );
    
                // Mettre à jour les quantités d'ingrédients
                for (const ingredient of ingredients.rows) {
                    const totalQuantityUsed = ingredient.quantité_in_plat * plat.quantite;
                    
                    await client.query(
                        `UPDATE connected_restaurant.ingredient
                         SET "quantité_ing" = "quantité_ing" - $1
                         WHERE id_ingedient = $2
                         RETURNING "quantité_ing", nom_igredient`,
                        [totalQuantityUsed, ingredient.id_ingredient]
                    );
    
                    // Vérifier si la quantité est en dessous du seuil
                    const updatedIngredient = await client.query(
                        `SELECT "quantité_ing", nom_igredient 
                         FROM connected_restaurant.ingredient 
                         WHERE id_ingedient = $1`,
                        [ingredient.id_ingredient]
                    );
    
                    if (updatedIngredient.rows[0].quantité_ing <= 10) {
                        await this._sendLowStockNotificationToGerant(
                            updatedIngredient.rows[0].nom_igredient,
                            updatedIngredient.rows[0].quantité_ing
                        );
                    }
                }
            }
    
            // Planifier la notification d'évaluation
            await this._scheduleRatingNotification(id_commande, commandeData.id_client, commandeData.id_table);
    
            // Envoyer la notification au cuisinier
            const notification = await this._sendNotificationToCuisinier(id_commande, commandeData.id_table, plats);
            await this._sendNotificationToClient(id_commande, commandeData.id_table, 'en_attente');
    
            // Valider la transaction
            await client.query('COMMIT');
    
            return {
                success: true,
                commande: newCommande.rows[0],
                notification: notification
            };
    
        } catch (error) {
            // Annuler la transaction en cas d'erreur
            await client.query('ROLLBACK');
            return {
                success: false,
                error: error.message
            };
        }
    },
            

    async _sendLowStockNotificationToGerant(ingredientName, remainingQuantity) {
        try {
            const gerant = await client.query(
                `SELECT id_personnel FROM connected_restaurant."Personnel"
                 WHERE personnel_type = 'chef' 
                 LIMIT 1`
            );
    
            if (!gerant.rows[0]) {
                throw new Error("Aucun gérant trouvé");
            }
    
            const notificationData = {
                id_gerant: gerant.rows[0].id_personnel,
                ingredient: ingredientName,
                remainingQuantity: remainingQuantity,
                message: `Attention: ${ingredientName} est presque en rupture de stock (${remainingQuantity}g restants)`,
                isRead: false,
                createdAt: fieldValue.serverTimestamp(),
                priority: 'high'
            };
    
            const notificationRef = await db.collection('notifications_gerant').add(notificationData);
    
            // ➕ NOTIFICATION PUSH
            await sendFCMNotification({
                id_user: gerant.rows[0].id_personnel,
                role: 'gerant',
                title: 'Stock faible',
                body: notificationData.message,
                data: {
                    ingredient: ingredientName,
                    remainingQuantity: String(remainingQuantity)
                }
            });
    
            return notificationRef.id;
        } catch (error) {
            console.error("Erreur dans _sendLowStockNotificationToGerant:", error);
            throw error;
        }
    }
,    

    async _sendNotificationToServeur(id_commande, id_table, plats) {
        if (!Array.isArray(plats)) {
            throw new Error('`plats` doit être un tableau');
        }
    
        try {
            const serveur = await client.query(
                `SELECT id_personnel FROM connected_restaurant."Personnel"
                 WHERE personnel_type = 'serveur' AND id_table_serveur = $1
                 LIMIT 1`,
                [id_table]
            );
    
            if (!serveur.rows[0]) {
                throw new Error("Aucun serveur assigné à cette table");
            }
    
            const platIds = plats.map(p => p.id_plat);
            const platsWithNames = await client.query(
                `SELECT id_plat, nom_plat FROM connected_restaurant."Plat"
                 WHERE id_plat = ANY($1)`,
                [platIds]
            );
    
            const platsDetails = plats.map(plat => {
                const platInfo = platsWithNames.rows.find(p => p.id_plat === plat.id_plat);
                return {
                    id_plat: plat.id_plat,
                    nom_plat: platInfo ? platInfo.nom_plat : 'Plat inconnu',
                    quantite: plat.quantite
                };
            });
    
            const notificationData = {
                id_commande: id_commande,
                id_table: id_table,
                id_serveur: serveur.rows[0].id_personnel,
                plats: platsDetails,
                isRead: false,
                createdAt: fieldValue.serverTimestamp(),
                status: 'prête',
                message: `Commande prête pour la table ${id_table}`
            };
    
            const notificationRef = await db.collection('notifications_serveur').add(notificationData);
    
            // ➕ NOTIFICATION PUSH
            await sendFCMNotification({
                id_user: serveur.rows[0].id_personnel,
                role: 'serveur',
                title: 'Commande prête',
                body: notificationData.message,
                data: {
                    id_commande: String(id_commande),
                    plats: JSON.stringify(platsDetails)
                }
            });
    
            return notificationRef.id;
        } catch (error) {
            console.error("Erreur dans _sendNotificationToServeur:", error);
            throw error;
        }
    }
,    



    

async _sendNotificationToCuisinier(id_commande, id_table, plats) {
    if (!Array.isArray(plats)) {
        throw new Error('`plats` doit être un tableau');
    }

    try {
        const cuisiniers = await client.query(
            `SELECT id_personnel FROM connected_restaurant."Personnel"
             WHERE personnel_type = 'cuisinier'
             LIMIT 1`
        );

        if (!cuisiniers.rows.length) {
            throw new Error("Aucun cuisinier trouvé");
        }

        const platIds = plats.map(p => p.id_plat);
        const platsWithNames = await client.query(
            `SELECT id_plat, nom_plat FROM connected_restaurant."Plat"
             WHERE id_plat = ANY($1)`,
            [platIds]
        );

        const platsDetails = plats.map(plat => {
            const platInfo = platsWithNames.rows.find(p => p.id_plat === plat.id_plat);
            return {
                id_plat: plat.id_plat,
                nom_plat: platInfo ? platInfo.nom_plat : 'Plat inconnu',
                quantite: plat.quantite
            };
        });

        const notificationIds = [];
        for (const cuisinier of cuisiniers.rows) {
            const notificationData = {
                id_commande: id_commande,
                id_table: id_table,
                id_cuisinier: cuisinier.id_personnel,
                plats: platsDetails,
                isRead: false,
                createdAt: fieldValue.serverTimestamp(),
                status: 'en_attente',
                message: `Nouvelle commande pour la table ${id_table}`
            };

            const notificationRef = await db.collection('notifications_cuisine').add(notificationData);
            notificationIds.push(notificationRef.id);

            // ➕ NOTIFICATION PUSH
            await sendFCMNotification({
                id_user: cuisinier.id_personnel,
                role: 'cuisinier',
                title: 'Nouvelle commande',
                body: notificationData.message,
                data: {
                    id_commande: String(id_commande),
                    plats: JSON.stringify(platsDetails)
                }
            });
        }

        return notificationIds;
    } catch (error) {
        console.error("Erreur dans _sendNotificationToCuisinier:", error);
        throw error;
    }
},
async _sendNotificationToClient(id_commande, id_table, status) {
    try {
        const clientData = await client.query(
            `SELECT id_client FROM connected_restaurant.commande WHERE id_commande = $1`,
            [id_commande]
        );

        if (!clientData.rows[0]) {
            throw new Error("Client introuvable");
        }

        const notificationData = {
            id_commande: id_commande,
            id_table: id_table,
            id_client: clientData.rows[0].id_client,
            status: status,
            isRead: false,
            createdAt: fieldValue.serverTimestamp(),
            message: status === 'en_cours_de_préparation'
            ? 'Votre commande est en cours de préparation'
            : status === 'prête'
            ? 'Votre commande est prête !'
            : status === 'en_attente'
            ? 'Votre commande a été envoyée avec succès'
            : ''
        };

        const notificationRef = await db.collection('notifications_client').add(notificationData);

        // ➕ NOTIFICATION PUSH
        await sendFCMNotification({
            id_user: clientData.rows[0].id_client,
            role: 'client',
            title: 'Commande mise à jour',
            body: notificationData.message,
            data: {
                id_commande: String(id_commande),
                status
            }
        });

        return notificationRef.id;
    } catch (error) {
        console.error("Erreur dans _sendNotificationToClient:", error);
        throw error;
    }
},



    async findallplat_in_commande(id_commande) {
        const result = await client.query(
            `SELECT pc.*, p.nom_plat 
             FROM connected_restaurant."Plat_commande" pc
             JOIN connected_restaurant."Plat" p ON pc.id_plat = p.id_plat
             WHERE pc.id_commande = $1`, 
            [id_commande]
        );
        return result.rows;
    },

    async updateCommandeByCuisinier(id_commande, newState) {
        const validStates = ['en_cours_de_préparation', 'prête'];
        if (!validStates.includes(newState)) {
            throw new Error('État non valide');
        }
    
        const result = await client.query(
            `UPDATE connected_restaurant.commande 
             SET "State_commande" = $2 
             WHERE id_commande = $1 
             RETURNING *`,
            [id_commande, newState]
        );
    
        const commandeDetails = await client.query(
            'SELECT id_table FROM connected_restaurant.commande WHERE id_commande = $1',
            [id_commande]
        );
        const id_table = commandeDetails.rows[0].id_table;
    
        // ✅ Mettre à jour le status dans Firestore (notifications cuisinier)
        const snapshot = await db.collection('notifications_cuisine')
            .where('id_commande', '==', parseInt(id_commande))
            .get();
    
        const updatePromises = snapshot.docs.map(doc => 
            doc.ref.update({ status: newState })
        );
    
        await Promise.all(updatePromises);
    
        // Notifier le client
        await this._sendNotificationToClient(id_commande, id_table, newState);
    
        if (newState === 'prête') {
            const plats = await this.findallplat_in_commande(id_commande);
            await this._sendNotificationToServeur(id_commande, id_table, plats);
        }
    
        return result.rows[0];
    },
    
    async processClientRating(id_notification, ratings) {
        try {
            await client.query('BEGIN');

            // 1. Vérifier si la notification existe et n'est pas déjà traitée
            const notificationRef = db.collection('client_rating_notifications').doc(id_notification);
            const notification = await notificationRef.get();

            if (!notification.exists || notification.data().status === 'completed') {
                throw new Error('Notification invalide ou déjà traitée');
            }

            const data = notification.data();

            // 2. Enregistrer les notes du serveur (si fournies)
            if (ratings.serveur) {
                await client.query(
                    `INSERT INTO connected_restaurant.note_serveur
                     (id_client, nb_etoile, avis, id_serveur)
                     VALUES ($1, $2, $3, $4)`,
                    [data.id_client, ratings.serveur.nb_etoile, ratings.serveur.avis || '', data.id_serveur]
                );
            }

            // 3. Enregistrer les notes des plats (si fournies)
            if (ratings.plats && Array.isArray(ratings.plats)) {
                for (const platRating of ratings.plats) {
                    await client.query(
                        `INSERT INTO connected_restaurant.note_plat
                         (id_client, nb_etoile, avis, id_plat)
                         VALUES ($1, $2, $3, $4)`,
                        [data.id_client, platRating.nb_etoile, platRating.avis || '', platRating.id_plat]
                    );
                }
            }

            // 4. Marquer comme complété
            await notificationRef.update({ status: 'completed' });

            await client.query('COMMIT');
            return { success: true };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Erreur dans processClientRating:", error);
            return { success: false, error: error.message };
        }
    },
    async callWaiter(id_client, id_table) {
        try {
            const serveur = await client.query(
                `SELECT id_personnel FROM connected_restaurant."Personnel"
                 WHERE personnel_type = 'serveur' AND id_table_serveur = $1`,
                [id_table]
            );
    
            if (!serveur.rows[0]) {
                throw new Error("Aucun serveur assigné à cette table");
            }
    
            const notificationData = {
                id_client: id_client,
                id_table: id_table,
                id_serveur: serveur.rows[0].id_personnel,
                message: `Le client à la table ${id_table} vous appelle`,
                isRead: false,
                createdAt: fieldValue.serverTimestamp(),
                type: 'call_waiter'
            };
    
            const notificationRef = await db.collection('notifications_serveur_pour_client').add(notificationData);
    
            // ➕ NOTIFICATION PUSH
            await sendFCMNotification({
                id_user: serveur.rows[0].id_personnel,
                role: 'serveur',
                title: 'Appel du client',
                body: notificationData.message,
                data: {
                    id_table: String(id_table),
                    id_client: String(id_client)
                }
            });
    
            return {
                success: true,
                notificationId: notificationRef.id
            };
    
        } catch (error) {
            console.error("Erreur dans callWaiter:", error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    async updateCommandePaymentStatus(id_commande, status) {
        await client.query(
          'UPDATE connected_restaurant.commande SET payment_status = $1 WHERE id_commande = $2',
          [status, id_commande]
        );
      }
,      
    
};






module.exports = commande;