class Ticket {
    constructor(id = null, eventId, eventDateId, customerId, paymentId, purchaseDate = null, price = null, qrCode = null, createdAt) {
        this.id = id
        this.eventId = eventId
        this.eventDateId = eventDateId
        this.customerId = customerId
        this.paymentId = paymentId
        this.purchaseDate = purchaseDate
        this.price = price
        this.qrCode = qrCode
        this.createdAt = createdAt
    }
}

module.exports = Ticket