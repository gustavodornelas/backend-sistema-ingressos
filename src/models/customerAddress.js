class customerAddress {

    constructor (id = null, customerId, name, address, addressNumber, city, state, zip_code, defaultAddress, createdAt = null) {
        this.id = id
        this.customerId = customerId
        this.name = name
        this.address = address
        this.addressNumber = addressNumber
        this.city = city
        this.state = state
        this.zipCode = zip_code
        this.defaultAddress = defaultAddress
        this.createdAt = createdAt
    }
}

module.exports = customerAddress