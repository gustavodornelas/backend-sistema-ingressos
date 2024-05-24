class EventDate {
    constructor(id = null, eventId, startTime, endTime, createdAt = null) {
        this.id = id;
        this.eventId = eventId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdAt = createdAt;
    }
}

module.exports = EventDate;