class Payment {
    constructor (id = null, customerId, asaasCustomerId, eventId, asaasId = null, value, billingType, transactionDate, dueDate, description, status, invoiceUrl, createdAt = null) {
        this.id = id
        this.customerId = customerId
        this.eventId = eventId
        this.asaasId = asaasId
        this.value = value
        this.billingType = billingType
        this.transactionDate = transactionDate
        this.dueDate = dueDate
        this.description = description
        this.status = status = invoiceUrl
        this.invoiceUrl
        this.createdAt = createdAt
    }

    importAsaasData(asaasId, status, invoiceUrl) {
        this.asaasId = asaasId
        this.status = status
        this.invoiceUrl = invoiceUrl    
    }
}

module.exports = Payment