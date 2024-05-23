class Venue {
    constructor (id = null, name, address, addressNumber, complement, province, city, state, postalCode, capacity, createdAt = null) {
        this.id = id
        this.name = name
        this.address = address
        this.addressNumber = addressNumber
        this.complement = complement
        this.province = province
        this.city = city
        this.state = state
        this.postalCode = postalCode
        this.capacity = capacity
        this.createdAt = createdAt
    }
}

module.exports = Venue