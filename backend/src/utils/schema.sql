CREATE DATABASE IF NOT EXISTS entrades_realtime;
USE entrades_realtime;

DROP TABLE IF EXISTS compres;
DROP TABLE IF EXISTS seients;
DROP TABLE IF EXISTS events;

CREATE TABLE events (
  id VARCHAR(50) PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  lloc VARCHAR(255) NOT NULL,
  imatge VARCHAR(255)
);

CREATE TABLE seients (
  id VARCHAR(50) NOT NULL,
  eventId VARCHAR(50) NOT NULL,
  category ENUM('STANDARD', 'PREMIUM', 'VIP') DEFAULT 'STANDARD',
  price DECIMAL(10, 2) NOT NULL,
  status ENUM('AVAILABLE', 'RESERVED', 'SOLD') DEFAULT 'AVAILABLE',
  reservedBy VARCHAR(255),
  expiresAt DATETIME,
  PRIMARY KEY (id, eventId),
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE compres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eventId VARCHAR(50) NOT NULL,
    seatId VARCHAR(50) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    preu DECIMAL(10, 2) NOT NULL,
    data_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES events(id),
    FOREIGN KEY (seatId, eventId) REFERENCES seients(id, eventId)
);

-- Seed Initial Data
INSERT INTO events (id, nom, data, lloc, imatge) VALUES
('1', 'Concert Rock', '2026-06-15', 'Palau Sant Jordi', '/images/concert.png'),
('2', 'Teatre: Els Miserables', '2026-07-20', 'Teatre Nacional', '/images/theater.png'),
('3', 'Festival de Jazz', '2026-08-05', 'Parc de la Ciutadella', '/images/jazz.png')
ON DUPLICATE KEY UPDATE id=id;
