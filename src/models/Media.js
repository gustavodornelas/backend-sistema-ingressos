class Media {
    constructor(id = null, nameMedia, pathMedia, eventId, type, createdAt) {
        this.id = id;
        this.nameMedia = nameMedia;
        this.pathMedia = pathMedia;
        this.eventId = eventId;
        this.type = type;
        this.createdAt = createdAt
    }
}

module.exports = Media;