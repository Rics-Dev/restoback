const db = require('../config/db');
const axios = require('axios');

class RecommendationService {
    async getClientPlats(clientId) {
        // 1. D'abord les plats notés >6/10 (max 6)
        const { rows: platsNotes } = await db.query(`
            SELECT p.nom_plat FROM connected_restaurant."Plat" p
            JOIN connected_restaurant.note_plat n ON p.id_plat = n.id_plat
            WHERE n.id_client = $1 AND n.nb_etoile > 4
            LIMIT 6
        `, [clientId]);

        let inputPlats = platsNotes.map(row => row.nom_plat);

        // 2. Si <6, compléter avec les plats favoris
        if (inputPlats.length < 6) {
            const { rows: platsFavoris } = await db.query(`
                SELECT p.nom_plat FROM connected_restaurant."Plat" p
                JOIN connected_restaurant.client_platpref f ON p.id_plat = f.id_plat
                WHERE f.id_client = $1 
                ${inputPlats.length > 0 ? `AND p.nom_plat NOT IN (${inputPlats.map((_, i) => `$${i + 2}`).join(',')})` : ''}
                LIMIT ${6 - inputPlats.length}
            `, [clientId, ...inputPlats]);
            inputPlats.push(...platsFavoris.map(row => row.nom_plat));
        }

        // 3. Si toujours <6, compléter avec les plats non notés de la dernière commande
        if (inputPlats.length < 6) {
            const { rows: platsNonNotes } = await db.query(`
                SELECT p.nom_plat 
                FROM connected_restaurant."Plat" p
                JOIN connected_restaurant."Plat_commande" pc ON p.id_plat = pc.id_plat
                JOIN connected_restaurant.commande c ON pc.id_commande = c.id_commande
                LEFT JOIN connected_restaurant.note_plat n ON p.id_plat = n.id_plat AND n.id_client = $1
                WHERE c.id_client = $1 
                AND n.id_plat IS NULL  -- Plats non notés
                ${inputPlats.length > 0 ? `AND p.nom_plat NOT IN (${inputPlats.map((_, i) => `$${i + 2}`).join(',')})` : ''}
                ORDER BY c."Date_commande" DESC
                LIMIT ${6 - inputPlats.length}
            `, [clientId, ...inputPlats]);
            inputPlats.push(...platsNonNotes.map(row => row.nom_plat));
        }

        return inputPlats.slice(0, 6);
    }
    async getPlatsFromPreferences(clientId, excludePlats = [], limit = 10) {
        const { rows: categories } = await db.query(`
            SELECT nom_categorie FROM connected_restaurant."Client_Categorie"
            WHERE id_client = $1
        `, [clientId]);
    
        if (!categories.length) return [];
    
        const placeholders = excludePlats.map((_, i) => `$${i + 2}`).join(',');
        const excludeClause = excludePlats.length ? `AND p.nom_plat NOT IN (${placeholders})` : '';
        
        const queryParams = [clientId, ...excludePlats];
    
        const { rows: plats } = await db.query(`
            SELECT p.nom_plat
            FROM connected_restaurant."Plat" p
            WHERE p.categorie_plat = ANY (
                SELECT nom_categorie FROM connected_restaurant."Client_Categorie"
                WHERE id_client = $1
            )
            AND p.id_plat NOT IN (
                SELECT id_plat FROM connected_restaurant.note_plat
                WHERE id_client = $1
            )
            ${excludeClause}
            GROUP BY p.nom_plat
            ORDER BY RANDOM()
            LIMIT ${limit}
        `, queryParams);
    
        return plats.map(row => row.nom_plat);
    }
    
    

    async getFinalRecommendations(clientId) {
        try {
            // 1. Récupérer les plats d'entrée
            const inputPlats = await this.getClientPlats(clientId);
            
            // 2. Debug avant l'envoi
            console.log("[DEBUG] Données à envoyer à Flask:", {
                user_id: clientId,
                plats: inputPlats
            });
    
            // 3. Appel à l'API Python avec configuration complète
            const { data } = await axios({
                method: 'post',
                url: 'https://reco-flask-production.up.railway.app/hybrid_recommend',
                data: { user_id: clientId, plats: inputPlats },
                headers: { 
                  'Content-Type': 'application/json',
                  'Connection': 'keep-alive'  // Ajout recommandé
                },
                timeout: 180000 // 20 secondes

              });
    
            // 4. Debug de la réponse
            console.log("[DEBUG] Réponse reçue de Flask:", data);
    
            let recommendations = data.hybrid_recommendations;
            
            // 5. Compléter avec préfére si nécessaire
            if (recommendations.length < 10) {
                const needed = 10 - recommendations.length;
                const extraPlats = await this.getPlatsFromPreferences(clientId, recommendations, needed);
                recommendations = [...recommendations, ...extraPlats];
            }
            
            
            return {
                success: true,
                clientId,
                inputPlats,
                content_based: data.content_based,
                collaborative: data.collaborative,
                recommendations: recommendations.slice(0, 10)
            };
            
        } catch (error) {
            // 6. Gestion d'erreur améliorée
            console.error('[ERREUR DÉTAILLÉE] Problème de recommandation:', {
                message: error.message,
                url: error.config?.url,
                dataSent: error.config?.data,
                responseData: error.response?.data,
                stack: error.stack
            });
            
            throw new Error(`Échec du système de recommandation: ${error.message}`);
        }
    };}

module.exports = new RecommendationService();