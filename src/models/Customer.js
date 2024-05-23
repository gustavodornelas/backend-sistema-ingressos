class Customer {
    constructor(id = null, name, email, phone, mobilePhone, cpfCnpj, personType, password, asaasId = null, createAt = null) {
        this.id = id
        this.name = name
        this.email = email
        this.phone = phone,
        this.mobilePhone = mobilePhone,
        this.cpfCnpj = cpfCnpj
        this.personType = personType
        this.password = password
        this.asaasId = asaasId
        this.createAt = createAt
    }
}

module.exports = Customer