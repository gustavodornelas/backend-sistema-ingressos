class EventDate {
    constructor(id = null, eventId, startTime, endTime, status = null, createdAt = null) {
        this.id = id
        this.eventId = eventId
        this.startTime = startTime
        this.endTime = endTime
        this.status = status
        this.createdAt = createdAt
    }
}

module.exports = EventDate