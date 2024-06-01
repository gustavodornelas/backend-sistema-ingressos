class Ticket {
    constructor(id = null, batchId, eventId, eventDateId, customerId, paymentId, purchaseDate = null, price = null, status = null, createdAt) {
        this.id = id
        this.batchId = batchId
        this.eventId = eventId
        this.eventDateId = eventDateId
        this.customerId = customerId
        this.paymentId = paymentId
        this.purchaseDate = purchaseDate
        this.price = price
        this.status = status
        this.createdAt = createdAt
    }
}

module.exports = Ticket