CREATE TABLE users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    cpf VARCHAR(15),
    cnpj VARCHAR(19),
    password VARCHAR(255) NOT NULL
);

CREATE TABLE tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    login_data DATE NOT NULL,
    logout_data DATE,
    CONSTRAINT FK_user_id FOREIGN KEY (user_id) REFERENCES users (id)
);