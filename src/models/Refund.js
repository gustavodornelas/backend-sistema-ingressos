class Refund {
    constructor(id = null, paymentId, status, value, refundDate, createdAt = null) {
        this.id = id
        this.paymentId = paymentId
        this.status = status
        this.value = value
        this.refundDate = refundDate
        this.createdAt = createdAt
    }
}

module.exports = Refund