class Event {
    constructor (id = null, name, description, venueId, createdAt = null) {
        this.id = id
        this.name=name
        this.description = description
        this.venueId = venueId
        this.createdAt = createdAt
    }
}

module.exports = Event