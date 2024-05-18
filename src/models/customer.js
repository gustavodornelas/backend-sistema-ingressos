class Customer {
    constructor(id = null, name, email, cpfCnpj, personType, password, asaasId) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.cpfCnpj = cpfCnpj;
        this.personType = personType;
        this.password = password;
        this.asaasId = asaasId;
    }
}

module.exports = Customer