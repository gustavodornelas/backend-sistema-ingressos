class CustomerAddress {

    constructor (id = null, customerId, name, address, addressNumber, complement, province, city, state, postalCode, defaultAddress, createdAt = null) {
        this.id = id
        this.customerId = customerId
        this.name = name
        this.address = address
        this.addressNumber = addressNumber
        this.complement = complement
        this.province = province
        this.city = city
        this.state = state
        this.postalCode = postalCode
        this.defaultAddress = defaultAddress
        this.createdAt = createdAt
    }
}

module.exports = CustomerAddress