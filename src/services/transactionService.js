const { v4: uuidv4 } = require('uuid');

const asaasService = require('../services/asaasService')
const ticketBatchService = require('../services/ticketBatchService')
const eventService = require('../services/eventService')

const dbPool = require('../config/dbPool')

const Payment = require('../models/Payment')
const Ticket = require('../models/Ticket');
const NoContentError = require('../CustomErrors/NoContentError');
const NotFoundError = require('../CustomErrors/NotFoundError');
const CartItem = require('../models/CartItem');


const createNewOrder = async (data) => {
    let connection = null

    try {

        // Iniciando conexão com banco de dados
        connection = await dbPool.getConnection()
        connection.beginTransaction()


        // Consultando carrinho de compras
        const sqlSelectCart = 'SELECT * FROM cart WHERE customer_id = ?'
        const [cartRows] = await connection.execute(sqlSelectCart, [data.customerId])

        if (cartRows.length === 0) {
            throw new NotFoundError('Nenhum item encontrado no carrinho')
        }

        const cartItems = cartRows.map(row => new CartItem(
            row.id,
            row.customer_id,
            row.ticket_batch_id,
            row.quantity,
            row.added_at
        ))

        let totalPrice = 0.0
        let description = ""
        let count = 1

        // Gerando dados dos ingressos, valores e descrição
        await Promise.all(cartItems.map(async (item) => {

            // Buscando lote de Ticket
            const { ticketBatchId, quantity } = item

            // Reservar Tickets Solicitados
            const sqlSelect = "SELECT ticket_batches.price as price, ticket_batches.description as description, ticket_batches.available_quantity as available_quantity, ticket_batches.reserved_quantity as reserved_quantity, events.name AS event_name " +
                "FROM ticket_batches JOIN events ON ticket_batches.event_id = events.id " +
                "WHERE ticket_batches.id = ?"

            const [selectResult] = await connection.execute(sqlSelect, [ticketBatchId]);

            if (selectResult === 0) {
                throw new NotFoundError("Erro ao encontrar lote de ingressos")
            }

            const reservedQuantity = parseInt(selectResult[0].reserved_quantity)
            const availableQuantity = parseInt(selectResult[0].available_quantity)
            const eventName = selectResult[0].event_name

            if (availableQuantity - reservedQuantity < quantity) {
                throw new Error(selectResult[0].description +  ": Quantidade solicitada menor que a quantidade disponivel")
            }

            const sqlUpdate = "UPDATE ticket_batches SET reserved_quantity = ? WHERE id = ?"
            const [resultSetHeader] = await connection.execute(sqlUpdate, [reservedQuantity + quantity, ticketBatchId])

            if (resultSetHeader.changedRows === 0) {
                if (resultSetHeader.affectedRows === 1) {
                    throw new NoContentError('Lote de ingressos atualizado sem alterações')
                }
                throw new NotFoundError('Lote de ingressos não encontrado')
            }

            // Atualizando valor do ticket, valor total do pedido e descrição do pedido
            const ticketBatch = await ticketBatchService.getTicketBatch(ticketBatchId)

            item.price = ticketBatch.price
            totalPrice += parseFloat(selectResult[0].price) * parseInt(quantity)

            if (count++ > 1) {
                description+= " | "
            }

            description += eventName + " " + quantity + " " + selectResult[0].description

            
        }))

        // Criando pagamento
        const payment = new Payment(
            null,
            data.customerId,
            data.eventId,
            null,
            totalPrice,
            data.billingType,
            null,
            data.dueDate,
            description,
            null,
            null,
        )
        
        // Criando pagamento no Asaas e complentando dados de Transação
        const asaasPayment = await asaasService.createPayment(payment)
        payment.importAsaasData(asaasPayment.id, asaasPayment.status, asaasPayment.invoiceUrl)
        
        // Criando pagamento no Banco de Dados
        const sqlPaymentInsert = `
            INSERT INTO payments (
                customer_id, event_id, asaas_id, value, billing_type, transaction_date, due_date, description, status, invoice_url
            ) VALUES (?, ?, ?, ?, ?, now(), ?, ?, ?, ?)`
        const [insertResult] = await connection.execute(sqlPaymentInsert, [
            payment.customerId,
            payment.eventId,
            payment.asaasId,
            payment.value,
            payment.billingType,
            payment.dueDate ? payment.dueDate : "now() + INTERVAL 30 DAY",
            payment.description,
            payment.status,
            payment.invoiceUrl
        ])

        // Recuperando o pagamento criado
        const newPaymentId = insertResult.insertId
        const sqlSelect = 'SELECT * FROM payments WHERE id = ?'
        const [paymentRows] = await connection.execute(sqlSelect, [newPaymentId])
        if (paymentRows.length === 0) {
            throw new Error('Erro ao recuperar o pagamento cadastrado')
        }
        const paymentRow = paymentRows[0]
        const newPayment = new Payment(
            paymentRow.id,
            paymentRow.customer_id,
            paymentRow.event_id,
            paymentRow.asaas_id,
            paymentRow.value,
            paymentRow.billing_type,
            paymentRow.transaction_date,
            paymentRow.due_date,
            paymentRow.description,
            paymentRow.status,
            paymentRow.invoice_url,
            paymentRow.created_at
        )

        // Criando tickets no banco de dados
        await Promise.all(cartItems.map(async (item) => {
            const { ticketBatch } = await ticketBatchService.getTicketBatch(item.ticketBatchId)

            for (let index = 0; index < item.quantity; index++) {

                const tickets = []

                // Verificando se o ingresso e somente para 1 data
                if (!ticketBatch.singleDateBatch) {

                    // Gerando ingresso individual
                    tickets.push(new Ticket(
                        null,
                        ticketBatch.id,
                        ticketBatch.eventId,
                        ticketBatch.eventDateId,
                        data.customerId,
                        newPayment.id,
                        null, // Data de pagamento só será atualizada quando a compra for confirmada
                        ticketBatch.price,
                        uuidv4(),
                        "RESERVED"
                    ))

                } else {
                    // Gerando ingressos para Passaporte, sendo 1 ingresso para cada data disponivel
                    const { ticketBatches } = await ticketBatchService.getAllEventTicketBatches(data.eventId)
                    ticketBatches.map(eventbatch => {
                        if (eventbatch.eventDateId) {
                            tickets.push(new Ticket(
                                null,
                                ticketBatch.id,
                                ticketBatch.eventId,
                                eventbatch.eventDateId,
                                data.customerId,
                                newPayment.id,
                                null, // Data de pagamento só será atualizada quando a compra for confirmada
                                ticketBatch.price,
                                uuidv4(),
                                "RESERVED"
                            ))
                        }
                    })

                }

                await Promise.all(tickets.map(async (ticket) => {
                    const sqlInsert = 'INSERT INTO tickets (batch_id, event_id, eventDate_id, customer_id, payment_id, purchase_date, price, qr_code, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    const [insertResult] = await connection.execute(sqlInsert, [
                        ticket.batchId,
                        ticket.eventId,
                        ticket.eventDateId,
                        ticket.customerId,
                        ticket.paymentId,
                        ticket.purchaseDate,
                        ticket.price,
                        ticket.qrCode,
                        ticket.status
                    ])
                }))
            }
        }))

        const cartDeleteSql = 'DELETE FROM cart WHERE customer_id = ?'
        await connection.execute(cartDeleteSql, [data.customerId])

        connection.commit()

        return { newPayment }

    } catch (error) {
        connection.rollback()
        console.error(error)
        if (error instanceof NotFoundError || NoContentError) {
            throw error
        }
        throw new Error('Erro ao reservar ingresssos')
    } finally {
        if (connection) {
            connection.release()
        }
    }

}

module.exports = { createNewOrder }