CREATE TABLE customers (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    cpfCnpj VARCHAR(15),
    personType VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    asaasId VARCHAR(20)
)

CREATE TABLE tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    login_data DATE NOT NULL,
    logout_data DATE,
    CONSTRAINT FK_user_id FOREIGN KEY (user_id) REFERENCES users (id)
);