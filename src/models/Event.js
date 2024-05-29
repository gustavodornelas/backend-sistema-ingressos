class Event {
    constructor (id = null, name, description, venueId, status = null, createdAt = null) {
        this.id = id
        this.name=name
        this.description = description
        this.venueId = venueId
        this.status = status
        this.createdAt = createdAt
    }
}

module.exports = Event