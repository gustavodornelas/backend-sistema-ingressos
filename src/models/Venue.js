class Venue {
    constructor (id = null, name, address, addressNumber, city, state, zipCode, capacity, createdAt = null) {
        this.id = id
        this.name = name
        this.address = address
        this.addressNumber = addressNumber
        this.city = city
        this.state = state
        this.zipCode = zipCode
        this.capacity = capacity
        this.createdAt = createdAt
    }
}

module.exports = Venue