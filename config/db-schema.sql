-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS connected_restaurant;

-- Create Client table if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant."Client" (
    id_client SERIAL PRIMARY KEY,
    name_client VARCHAR(100) NOT NULL,
    prenom_client VARCHAR(100) NOT NULL,
    "Age_client" INTEGER,
    "Num_tel_client" VARCHAR(20),
    mot_de_passe_client VARCHAR(100) NOT NULL,
    adress_client TEXT,
    adress_mail_client VARCHAR(100) UNIQUE NOT NULL
);

-- Create Personnel table if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant."Personnel" (
    id_personnel SERIAL PRIMARY KEY,
    nom_personnel VARCHAR(100) NOT NULL,
    prenom_personnel VARCHAR(100) NOT NULL,
    adress_personnel TEXT,
    adress_mail_personnel VARCHAR(100) UNIQUE NOT NULL,
    "Num_tel_personnel" VARCHAR(20),
    mot_de_pass_pessonel VARCHAR(100) NOT NULL,
    "Age_personnel" INTEGER,
    personnel_type VARCHAR(20) CHECK (personnel_type IN ('serveur', 'cuisinier', 'gerant')),
    id_table_serveur INTEGER
);

-- Create Table (restaurant tables) if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant."Table" (
    id_table SERIAL PRIMARY KEY,
    "number_table" INTEGER NOT NULL,
    "place_table" INTEGER NOT NULL,
    status_table VARCHAR(20) DEFAULT 'disponible' CHECK (status_table IN ('disponible', 'reservée', 'occupée'))
);

-- Add foreign key to Personnel for table assignment - with a check to avoid duplicates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_personnel_table' 
        AND conrelid = 'connected_restaurant."Personnel"'::regclass::oid
    ) THEN
        ALTER TABLE connected_restaurant."Personnel" 
        ADD CONSTRAINT fk_personnel_table 
        FOREIGN KEY (id_table_serveur) 
        REFERENCES connected_restaurant."Table"(id_table) 
        ON DELETE SET NULL;
    END IF;
END
$$;

-- Create Category table if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant."Categorie" (
    nom_categorie VARCHAR(50) PRIMARY KEY
);

-- Create Client_Categorie (junction table) if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant."Client_Categorie" (
    id_client INTEGER,
    nom_categorie VARCHAR(50),
    PRIMARY KEY (id_client, nom_categorie),
    FOREIGN KEY (id_client) REFERENCES connected_restaurant."Client"(id_client) ON DELETE CASCADE,
    FOREIGN KEY (nom_categorie) REFERENCES connected_restaurant."Categorie"(nom_categorie) ON DELETE CASCADE
);

-- Create Maladie (diseases/allergies) table if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant.maladie (
    id_maladie SERIAL PRIMARY KEY,
    nom_maladie VARCHAR(100) NOT NULL,
    desc_maladie TEXT
);

-- Create Client_Maladie (junction table) if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant.client_maladie (
    id_client INTEGER,
    id_maladie INTEGER,
    PRIMARY KEY (id_client, id_maladie),
    FOREIGN KEY (id_client) REFERENCES connected_restaurant."Client"(id_client) ON DELETE CASCADE,
    FOREIGN KEY (id_maladie) REFERENCES connected_restaurant.maladie(id_maladie) ON DELETE CASCADE
);

-- Create Table_reserv (reservations) if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant."Table_reserv" (
    id_reserv SERIAL PRIMARY KEY,
    id_client INTEGER NOT NULL,
    id_table INTEGER NOT NULL,
    nb_personne INTEGER NOT NULL,
    date_deb_res TIMESTAMP NOT NULL,
    date_fin_res TIMESTAMP NOT NULL,
    FOREIGN KEY (id_client) REFERENCES connected_restaurant."Client"(id_client) ON DELETE CASCADE,
    FOREIGN KEY (id_table) REFERENCES connected_restaurant."Table"(id_table) ON DELETE CASCADE
);

-- Create Plat (dishes) table if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant."Plat" (
    id_plat SERIAL PRIMARY KEY,
    nom_plat VARCHAR(100) NOT NULL,
    image_plat TEXT,
    "Description_plat" TEXT,
    "Prix_plat" DECIMAL(10, 2) NOT NULL,
    info_calorie INTEGER,
    categorie_plat VARCHAR(50),
    "Ajout_date" DATE DEFAULT CURRENT_DATE,
    note_plat DECIMAL(3, 1) DEFAULT 0,
    moment VARCHAR(20) CHECK (moment IN ('petit dej', 'dejeuner', 'dinner', 'snack')),
    FOREIGN KEY (categorie_plat) REFERENCES connected_restaurant."Categorie"(nom_categorie) ON DELETE SET NULL
);

-- Create Ingredient table if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant.ingredient (
    id_ingedient SERIAL PRIMARY KEY,
    nom_igredient VARCHAR(100) NOT NULL,
    "quantité_ing" DECIMAL(10, 2) NOT NULL
);

-- Create Ingredient_in_plat (junction table) if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant.ingredient_in_plat (
    id_plat INTEGER,
    id_ingredient INTEGER,
    "quantité_in_plat" DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_plat, id_ingredient),
    FOREIGN KEY (id_plat) REFERENCES connected_restaurant."Plat"(id_plat) ON DELETE CASCADE,
    FOREIGN KEY (id_ingredient) REFERENCES connected_restaurant.ingredient(id_ingedient) ON DELETE CASCADE
);

-- Create Maladie_in_plat (junction table) if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant."Maladie_in_plat" (
    id_plat INTEGER,
    id_maladie INTEGER,
    PRIMARY KEY (id_plat, id_maladie),
    FOREIGN KEY (id_plat) REFERENCES connected_restaurant."Plat"(id_plat) ON DELETE CASCADE,
    FOREIGN KEY (id_maladie) REFERENCES connected_restaurant.maladie(id_maladie) ON DELETE CASCADE
);

-- Create Commande (orders) table if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant.commande (
    id_commande SERIAL PRIMARY KEY,
    id_client INTEGER NOT NULL,
    "State_commande" VARCHAR(30) CHECK ("State_commande" IN ('en_attente', 'en_cours_de_préparation', 'prête', 'servie', 'annulée')),
    "Date_commande" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mode_payment VARCHAR(30) CHECK (mode_payment IN ('espèce', 'carte_banquaire', 'ticket_resto')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    id_table INTEGER,
    FOREIGN KEY (id_client) REFERENCES connected_restaurant."Client"(id_client) ON DELETE CASCADE,
    FOREIGN KEY (id_table) REFERENCES connected_restaurant."Table"(id_table) ON DELETE SET NULL
);

-- Create Plat_commande (order items) if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant."Plat_commande" (
    id_plat INTEGER,
    id_commande INTEGER,
    quantite INTEGER NOT NULL,
    PRIMARY KEY (id_plat, id_commande),
    FOREIGN KEY (id_plat) REFERENCES connected_restaurant."Plat"(id_plat) ON DELETE CASCADE,
    FOREIGN KEY (id_commande) REFERENCES connected_restaurant.commande(id_commande) ON DELETE CASCADE
);

-- Create Offre (promotions) table if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant."Offre" (
    id_offre SERIAL PRIMARY KEY,
    date_deb_offre DATE NOT NULL,
    date_fin_offre DATE NOT NULL,
    reduction DECIMAL(5, 2) NOT NULL
);

-- Create Offre_plat (promotion-dish junction) if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant.offre_plat (
    id_offre INTEGER,
    id_plat INTEGER,
    PRIMARY KEY (id_offre, id_plat),
    FOREIGN KEY (id_offre) REFERENCES connected_restaurant."Offre"(id_offre) ON DELETE CASCADE,
    FOREIGN KEY (id_plat) REFERENCES connected_restaurant."Plat"(id_plat) ON DELETE CASCADE
);

-- Create Client_platpref (client favorite dishes) if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant.client_platpref (
    id_client INTEGER,
    id_plat INTEGER,
    PRIMARY KEY (id_client, id_plat),
    FOREIGN KEY (id_client) REFERENCES connected_restaurant."Client"(id_client) ON DELETE CASCADE,
    FOREIGN KEY (id_plat) REFERENCES connected_restaurant."Plat"(id_plat) ON DELETE CASCADE
);

-- Create Note_plat (dish ratings) table if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant.note_plat (
    id_client INTEGER,
    id_plat INTEGER,
    nb_etoile INTEGER CHECK (nb_etoile BETWEEN 0 AND 5),
    avis TEXT,
    date_note TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_client, id_plat),
    FOREIGN KEY (id_client) REFERENCES connected_restaurant."Client"(id_client) ON DELETE CASCADE,
    FOREIGN KEY (id_plat) REFERENCES connected_restaurant."Plat"(id_plat) ON DELETE CASCADE
);

-- Create Note_serveur (waiter ratings) table if it doesn't exist
CREATE TABLE IF NOT EXISTS connected_restaurant.note_serveur (
    id_client INTEGER,
    id_serveur INTEGER,
    nb_etoile INTEGER CHECK (nb_etoile BETWEEN 0 AND 5),
    avis TEXT,
    date_note TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_client, id_serveur),
    FOREIGN KEY (id_client) REFERENCES connected_restaurant."Client"(id_client) ON DELETE CASCADE,
    FOREIGN KEY (id_serveur) REFERENCES connected_restaurant."Personnel"(id_personnel) ON DELETE CASCADE
);
