class Customer {
    constructor(id = null, name, email, cpfCnpj, personType, password, asaasId = null, createAt = null) {
        this.id = id
        this.name = name
        this.email = email
        this.cpfCnpj = cpfCnpj
        this.personType = personType
        this.password = password
        this.asaasId = asaasId
        this.createAt = createAt
    }
}

module.exports = Customer