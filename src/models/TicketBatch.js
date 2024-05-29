class TicketBatch {
    constructor(id = null, eventId, singleDateBatch, eventDateId, description, quantity, availableQuantity, price, batchDate, status, createdAt) {
        this.id = id;
        this.eventId = eventId;
        this.singleDateBatch = singleDateBatch;
        this.eventDateId = eventDateId;
        this.description = description;
        this.quantity = quantity;
        this.availableQuantity = availableQuantity;
        this.price = price;
        this.batchDate = batchDate;
        this.status = status;
        this.createdAt = createdAt;
    }
}

module.exports = TicketBatch;
