class CartItem {
    constructor(id = null, customerId, ticketBatchId, quantity, addedAt = null) {
        this.id = id;
        this.customerId = customerId;
        this.ticketBatchId = ticketBatchId;
        this.quantity = quantity;
        this.addedAt = addedAt;
    }
}

module.exports = CartItem;
